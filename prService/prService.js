async function getPullRequests(username, repository) {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${username}/${repository}/pulls`
    );
    const pullRequestCount = response.data.length;
    return pullRequestCount;
  } catch (error) {
    throw error;
  }
}

// Usage example
const username = "exampleuser";
const repository = "exampleRepo";
getPullRequests(username, repository)
  .then((pullRequestCount) => {
    console.log(`${username} has created ${pullRequestCount} pull requests.`);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
