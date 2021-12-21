exports = function (arg) {
  console.log("Start: fnGitHubSync");
  try {
    const { Octokit } = require("octokit");
    const GITHUB_API_TOKEN = context.values.get("GitHub-Auth-Key");
    const octokit = new Octokit({ auth: GITHUB_API_TOKEN });

    const database = "gripDB";

    const reposCollection = context.services
      .get("mongodb-atlas")
      .db(database)
      .collection("repos");

    const reposResult = context.functions.execute(
      "fnGitHubOrgRepos",
      octokit,
      reposCollection
    );

    const membersCollection = context.services
      .get("mongodb-atlas")
      .db(database)
      .collection("members");

    const membersResult = context.functions.execute(
      "fnGitHubOrgMembers",
      octokit,
      membersCollection
    );

    return { repos: reposResult, members: membersResult };
  } catch (err) {
    console.error(err);
  }
  console.log("End: fnGitHubSync");
};
