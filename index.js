const exec = require("@actions/exec");
const filter = require("lodash.filter");

async function isAncestor(ancestor, descendent) {
  return (
    0 ===
    (await exec("git", ["merge-base", "--is-ancestor", ancestor, descendent]))
  );
}

(async function() {
  const core = require("@actions/core");
  const github = require("@actions/github");

  try {
    const nameToGreet = core.getInput("who-to-greet");
    const octokit = new github.GitHub(core.getInput("GITHUB_TOKEN"));
    console.log(`Initialized connection to github`);

    const thisPullRequest = github.context.payload.pull_request.id;
    console.log(`Handling pull request ${thisPullRequest}`);

    const pullRequests = await octokit.pulls.list(github.context.repo);
    const other = filter(pullRequests, pr => pr.id != thisPullRequest);
    //const pullRequestsString = JSON.stringify(pullRequests, undefined, 2);
    console.log(`There are ${other.length} other pull requests`);

    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
