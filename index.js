const core = require('@actions/core');
const github = require('@actions/github');

try {
  const nameToGreet = core.getInput('who-to-greet');
  const octokit = new github.GitHub(core.getInput("GITHUB_TOKEN"))
  console.log(`Initialized connection to github`);

  const pullRequests = octokit.pulls.list(github.context.repo);
  console.log(`Here are the pull requests! ${pullRequests}`);

  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
