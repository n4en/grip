//get All the GitHub Org Repos
const getAllGitHubRepos = async (octokit) => {
  console.log("Executing method getAllGitHubRepos");
  const response = await octokit.request("GET /orgs/{org}/repos", {
    org: "datadlog",
  });

  return response.data;
};

// UPSERT (INSERT + UPDATE) the records, if exists update else insert
const upsertRepos = async (collection, data, octokit) => {
  console.log("Executing method upsertRepos");
  for (let index = 0; index < data.length; index++) {
    const repo = data[index];
    const query = { id: repo.id };
    const {
      pulls_url,
      milestones_url,
      forks_url,
      keys_url,
      collaborators_url,
      teams_url,
      hooks_url,
      issue_events_url,
      events_url,
      assignees_url,
      branches_url,
      tags_url,
      blobs_url,
      git_tags_url,
      git_refs_url,
      trees_url,
      statuses_url,
      languages_url,
      stargazers_url,
      contributors_url,
      subscribers_url,
      subscription_url,
      commits_url,
      git_commits_url,
      comments_url,
      issue_comment_url,
      contents_url,
      compare_url,
      merges_url,
      archive_url,
      downloads_url,
      issues_url,
      notifications_url,
      labels_url,
      releases_url,
      deployments_url,
      owner,
      svn_url,
      ...updatedRepoData
    } = repo;

    const {
      avatar_url,
      gravatar_id,
      followers_url,
      following_url,
      gists_url,
      starred_url,
      subscriptions_url,
      organizations_url,
      repos_url,
      received_events_url,
      ...updatedOwner
    } = owner;

    const languages = await octokit.request(languages_url);
    const teams = await octokit.request(teams_url);
    const collaborators = await octokit.request(
      "GET /repos/{owner}/{repo}/collaborators",
      {
        owner: owner.login,
        repo: repo.name,
      }
    );

    const updatedCollaborators = [];

    collaborators.data.map((record) => {
      const { login, id, node_id, type, site_admin, permissions, role_name } =
        record;
      updatedCollaborators.push({
        login: login,
        id: id,
        node_id: node_id,
        type: type,
        site_admin: site_admin,
        permissions: permissions,
        role_name: role_name,
      });
    });

    const updatedTeams = [];

    teams.data.map((record) => {
      const {
        name,
        id,
        node_id,
        slug,
        description,
        privacy,
        permission,
        permissions,
      } = record;
      updatedTeams.push({
        name: name,
        id: id,
        node_id: node_id,
        slug: slug,
        description: description,
        privacy: privacy,
        permission: permission,
        permissions: permissions,
      });
    });

    const updatedData = {
      ...updatedRepoData,
      ...{ owner: updatedOwner },
      ...{ collaborators: updatedCollaborators },
      ...{ languages: languages.data },
      ...{ teams: updatedTeams },
    };

    const update = { $set: updatedData };
    const options = { returnNewDocument: true, new: true, upsert: true };

    collection.findOneAndUpdate(query, update, options);
  }

  return `Total repos ${data.length} `;
};
// Main method
exports = async function (octokit, collection) {
  console.log("Start: fnGitHubOrgRepos");
  let response;
  try {
    const data = await getAllGitHubRepos(octokit);
    response = await upsertRepos(collection, data, octokit);
  } catch (err) {
    console.error(err);
  }
  console.log("End: fnGitHubOrgRepos");
  return { message: response };
};
