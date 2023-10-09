const axios = require("axios");
const AWS = require("aws-sdk");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
  fromIni,
} = require("@aws-sdk/client-secrets-manager");
const { SharedIniFileCredentials } = require("aws-sdk");
const Octokit = require("@octokit/rest");

const secret_name = "GitToken";
const secretsManagerClient = new SecretsManagerClient({
  region: "ap-south-1",
});

const dynamodb = new AWS.DynamoDB({ region: "ap-south-1" });

// const octokit = new Octokit({
//   auth: token,
// });

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

  let response;

  // try {
  //   response = await secretsManagerClient.send(
  //     new GetSecretValueCommand({
  //       SecretId: secret_name,
  //       VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
  //     })
  //   );
  // } catch (error) {
  //   console.error(
  //     "Error fetching GitHub token from AWS Secrets Manager:",
  //     error
  //   );
  //   throw error;
  // }

  // const secret = response.SecretString;
}

async function getGitHubCommitCount() {
  try {
    //const token = await getGitHubToken();
    const token = "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";

    //const token = "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";

    const username = "LiniEisha";
    console.log("GitHub Token:", token);
    const response = await axios.get(
      `https://api.github.com/users/${username}/events`,
      {
        headers: {
          Authorization: `token ${token || ""}`,
        },
      }
    );

    console.log("for loop starting");
    let commitCount = 0;

    for (const event of response.data) {
      const repoResponse = await axios.get(event.repo.url + "/commits", {
        headers: {
          Authorization: `token ${token || ""}`,
        },
      });

      commitCount += repoResponse.data.length;
    }

    console.log(`Total commits for user '${username}': ${commitCount}`);

    const params = {
      TableName: "aecs_commits", // Replace with your DynamoDB table name
      Item: {
        username: { S: username },
        commitCount: { N: commitCount.toString() },
      },
    };

    await dynamodb.putItem(params).promise();

    console.log(`Commit count for user '${username}' stored in DynamoDB.`);
  } catch (error) {
    console.error("Error fetching GitHub commit count:", error);
  }
}

// Usage
getGitHubCommitCount();
