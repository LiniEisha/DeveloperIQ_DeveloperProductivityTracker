const { Octokit } = require("@octokit/rest");

// Replace 'YOUR-TOKEN' with your actual GitHub personal access token
const token = "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";

const octokit = new Octokit({
  auth: token, // Pass the token as the 'auth' option
});

async function getGitHubCommitCount() {
  try {
    const username = "LiniEisha";

    const response = await octokit.activity.listEventsForUser({
      username,
    });

    console.log("for loop starting");
    let commitCount = 0;

    for (const event of response.data) {
      if (event.type === "PushEvent") {
        // Extract the owner and repo name from the event payload
        const payload = event.payload;
        const owner = payload.ref.split("/")[2]; // Extract the owner
        const repo = payload.ref.split("/")[3]; // Extract the repo name

        // Use octokit.request to fetch commits for a specific repository
        const repoResponse = await octokit.request(
          "GET /repos/:owner/:repo/commits",
          {
            owner,
            repo,
          }
        );

        commitCount += repoResponse.data.length;
      }
    }

    console.log(`Total commits for user '${username}': ${commitCount}`);
  } catch (error) {
    console.error("Error fetching GitHub commit count:", error);
  }
}

// Usage
getGitHubCommitCount();
