const axios = require("axios");
const AWS = require("aws-sdk");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
const { SharedIniFileCredentials } = require("aws-sdk");

const secret_name = "GitToken";
const secretsManagerClient = new SecretsManagerClient({
  region: "ap-south-1",
});

const dynamodb = new AWS.DynamoDB({ region: "ap-south-1" });

async function getGitHubToken() {
  try {
    // Load AWS credentials from the shared AWS credentials file (typically located at ~/.aws/credentials)
    const awsCredentials = new SharedIniFileCredentials();

    // Create AWS SDK SecretsManagerClient using the loaded credentials
    const secretsManagerClient = new SecretsManagerClient({
      region: "ap-south-1",
      credentials: awsCredentials,
    });

    const response = await secretsManagerClient.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );

    return JSON.parse(response.SecretString).github_token;
  } catch (error) {
    console.error(
      "Error fetching GitHub token from AWS Secrets Manager:",
      error
    );
    throw error;
  }
}

async function getGitHubIssueCount() {
  try {
    //const token = await getGitHubToken();
    const token = "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";
    const username = "LiniEisha";

    // Use the GitHub Search API to find issues authored by the user
    const response = await axios.get(
      `https://api.github.com/search/issues?q=author:${username}`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );

    const issueCount = response.data.total_count;
    console.log(`Total issues authored by '${username}': ${issueCount}`);

    const params = {
      TableName: "aecs_issues", // Replace with your DynamoDB table name
      Item: {
        username: { S: username },
        issueCount: { N: issueCount.toString() },
      },
    };

    await dynamodb.putItem(params).promise();

    console.log(`Issue count for user '${username}' stored in DynamoDB.`);
  } catch (error) {
    console.error("Error fetching GitHub issue count:", error);
  }
}

// Usage
getGitHubIssueCount();
