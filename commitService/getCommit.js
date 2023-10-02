const AWS = require("aws-sdk");
//const { SecretsManager } = require("aws-sdk");
// Replace v2 imports with v3 imports
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { SecretsManager } = require("@aws-sdk/client-secrets-manager");

// Initialize a DynamoDB client
const dynamodb = new AWS.DynamoDB({ region: "ap-south-1" });

// Specify the table name and column (attribute) name
const table_name = "aecs_commits";
const column_name = "commitId";

// Initialize a DynamoDB table resource
const table = new AWS.DynamoDB.DocumentClient({ service: dynamodb });

// Define asynchronous functions to retrieve the maximum commit ID and GitHub token
async function getMaxCommitId() {
  try {
    const data = await table.scan({ TableName: table_name }).promise();
    const items = data.Items || [];
    if (items.length > 0) {
      const max_value = Math.max(...items.map((item) => item[column_name]));
      console.log(`The maximum value for ${column_name} is: ${max_value}`);
      return max_value + 1;
    } else {
      console.log(`No items found in the table`);
      return 1;
    }
  } catch (err) {
    console.error("Error scanning the table:", err);
    return -1;
  }
}

async function getGhToken() {
  const secret_name = "GITHUB_PAT";
  const region_name = "ap-south-1";
  const client = new SecretsManager({ region: region_name });

  try {
    const data = await client
      .getSecretValue({ SecretId: secret_name })
      .promise();
    const secret = JSON.parse(data.SecretString);
    console.log(typeof secret.github_token);
    return secret.github_token;
  } catch (err) {
    console.error("Error getting secret:", err);
    return null;
  }
}

module.exports = {
  getMaxCommitId,
  getGhToken,
};
