const exec= require("@actions/exec");

async function isAncestor(ancestor, descendent) {
    return 0 === await    exec("git", ["merge-base", "--is-ancestor", ancestor, descendent]);

}

(async function() {
  const core = require("@actions/core");
  const github = require("@actions/github");

  try {
    const nameToGreet = core.getInput("who-to-greet");
    const octokit = new github.GitHub(core.getInput("GITHUB_TOKEN"));
    console.log(`Initialized connection to github`);

    const pullRequests = await octokit.pulls.list(github.context.repo);
    const pullRequestsString = JSON.stringify(pullRequests, undefined, 2);
    console.log(`Here are the pull requests! ${pullRequestsString}`);

    const time = new Date().toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
