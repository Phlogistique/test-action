const exec = require("@actions/exec");
const filter = require("lodash.filter");
const core = require("@actions/core");
const github = require("@actions/github");

async function isAncestor(ancestor, descendent) {
  return (
    0 ===
    (await exec("git", ["merge-base", "--is-ancestor", ancestor, descendent]))
  );
}

async function thisPrId() {
  return github.context.payload.pull_request.id;
}

async function findClosestAncestorPr(octokit, thisPullRequest) {
    const pullRequests = await octokit.pulls.list(github.context.repo);
    const other = filter(pullRequests.data, pr => pr.id != thisPullRequest);

    console.log(`pull requests: ${JSON.stringify(other, undefined, 2)}`)

}

(async function() {

  try {
    const nameToGreet = core.getInput("who-to-greet");
    const octokit = new github.GitHub(core.getInput("GITHUB_TOKEN"));
    console.log(`Initialized connection to github`);

    const thisPullRequest = github.context.payload.pull_request.id;
    console.log(`Handling pull request ${thisPullRequest}`);

    await findClosestAncestorPr(octokit, thisPullRequest);

    //console.log(`There are ${other.length} other pull requests`);

    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
