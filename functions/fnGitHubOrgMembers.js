//get All the GitHub Org Members
const getAllGitHubMembers = async (octokit) => {
  console.log("Executing method getAllGitHubMembers");
  const response = await octokit.request("GET /orgs/{org}/members", {
    org: "datadlog",
  });

  return response.data;
};

// UPSERT (INSERT + UPDATE) the records, if exists update else insert
const upsertGitHubMembers = async (collection, data) => {
  console.log("Executing method upsertGitHubMembers");
  data.map((record) => {
    const query = { id: record.id };
    const {
      followers_url,
      following_url,
      gists_url,
      starred_url,
      subscriptions_url,
      organizations_url,
      repos_url,
      events_url,
      received_events_url,
      ...updatedData
    } = record;

    const update = { $set: updatedData };
    const options = { returnNewDocument: true, new: true, upsert: true };

    collection.findOneAndUpdate(query, update, options);
  });

  return `Total members ${data.length} `;
};
// Main method
exports = async function (octokit, collection) {
  console.log("Start: fnGitHubOrgMembers");
  let response;
  try {
    const data = await getAllGitHubMembers(octokit);
    response = await upsertGitHubMembers(collection, data);
  } catch (err) {
    console.error(err);
  }
  console.log("End: fnGitHubOrgMembers");
  return { message: response };
};
