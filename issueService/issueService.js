async function getIssues(username, repository) {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${username}/${repository}/issues`
    );
    const issueCount = response.data.length;
    return issueCount;
  } catch (error) {
    throw error;
  }
}

// Usage example
const username = "exampleuser";
const repository = "exampleRepo";
getIssues(username, repository)
  .then((issueCount) => {
    console.log(`${username} has opened ${issueCount} issues.`);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
