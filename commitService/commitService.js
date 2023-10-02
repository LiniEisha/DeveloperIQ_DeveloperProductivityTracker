const axios = require("axios");
const AWS = require("aws-sdk");
const getCommint = require("./getCommit");
// Replace v2 imports with v3 imports
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { SecretsManager } = require("@aws-sdk/client-secrets-manager");

// import { getGhToken } from "./getCommit";

const username = "LiniEisha";
//const token = "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";

async function main() {
  const token = await getCommit.getGhToken();
  console.log(ghToken);
  const url = `https://api.github.com/users/${username}/events`;

  axios
    .get(url, { headers: { Authorization: `token ${token}` } })
    .then((response) => {
      const events = response.data;
      const commits = [];
      const region = "ap-south-1";
      const dynamodb = new AWS.DynamoDB({ region });
      const table_name = "aecs_commits";
      const table = dynamodb.Table(table_name);

      let maxId = getCommint.getMaxCommitId();

      for (const event of events) {
        if (event.type === "PushEvent") {
          for (const commit of event.payload.commits.slice(0, 15)) {
            console.log(commit);
            commits.push(commit.url);

            table.putItem(
              {
                TableName: table_name,
                Item: {
                  commitId: { N: maxId.toString() },
                  gh_username: { S: username },
                  commit_url: { S: commit.url },
                },
              },
              (err, data) => {
                if (err) {
                  console.error("Error putting item:", err);
                } else {
                  console.log("PutItem succeeded:", data);
                }
              }
            );
            maxId++;
          }
        }
      }
    })
    .catch((error) => {
      console.error(`Error: ${error}`);
    });
}

// Sample code to fetch the number of commits for a developer using the GitHub API

// const axios = require("axios");

// async function getCommits(username, repository) {
//   try {
//     const response = await axios.get(
//       `https://api.github.com/repos/${username}/${repository}/commits`
//     );
//     const commitCount = response.data.length;
//     return commitCount;
//   } catch (error) {
//     throw error;
//   }
// }

// // Usage example
// const username = "LiniEisha";
// const repository = "procsupport-api";
// getCommits(username, repository)
//   .then((commitCount) => {
//     console.log(`${username} has ${commitCount} commits.`);
//   })
//   .catch((error) => {
//     console.error("Error:", error.message);
//   });
