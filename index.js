const exec = require("@actions/exec");
const core = require("@actions/core");
const github = require("@actions/github");
const filter = require("lodash.filter");

async function isAncestor(ancestor, descendent) {
  return (
    0 ===
    (await exec("git", ["merge-base", "--is-ancestor", ancestor, descendent]))
  );
}

async function exec_capture(cmd, args) {
  let out = "";
  let err = "";
  const options = {
    listeners: {
      stdout: (data) => {
        out += data.toString();
      },
      stderr: (data) => {
        err += data.toString();
      },
    },
  };
  let retcode = await exec(cmd, args, options);
  if (retcode != 0) {
    throw `Invalid exit code ${retcode} for command ${cmd} ${args}:\n${err}`;
  }

  return out;
}

async function age(ancestor, descenent) {
  return parseInt(
    await exec_capture("git", ["rev-list", "--count", ancestor, descendent])
  );
}

async function thisPrId() {
  return github.context.payload.pull_request.id;
}

async function asyncFilter(arr, iteratee) {
  const result = [];

  for (const item of arr) {
    if (await iteratee(item)) {
      result.push(item);
    }
  }

  return result;
}

async function asyncMinBy(arr, iteratee) {
  let result = arr[0];
  let min = iteratee(result);

  for (const item of arr.slice(1)) {
    const val = await iteratee(item);
    if (val < min) {
      min = val;
      result = item;
    }
  }

  return result;
}

async function findClosestAncestorPr(octokit, thisPullRequest) {
  const pullRequests = await octokit.pulls.list(github.context.repo);
  const other = filter(pullRequests.data, (pr) => pr.id != thisPullRequest.id);

  console.log(`other pull requests: ${JSON.stringify(other, undefined, 2)}`);
  console.log(`other pull requests: ${other.length}`);

  if (other.length == 0) return null;

  const ancestors = asyncFilter(
    other,
    async (pr) => await isAncestor(pr.head.sha, thisPullRequest.head.sha)
  );

  console.log(`ancestors: ${ancestors.length}`);

  if (ancestors.length == 0) return null;

  mostRecentAncestor = asyncMinBy(
    ancestors,
    async (pr) => await age(pr.head.sha, thisPullRequest.head.sha)
  );

  return mostRecentAncestor;
}

(async function () {
  try {
    const nameToGreet = core.getInput("who-to-greet");
    const octokit = new github.GitHub(core.getInput("GITHUB_TOKEN"));
    console.log(`Initialized connection to github`);

    const thisPullRequest = github.context.payload.pull_request;
    console.log(`Handling pull request ${thisPullRequest.id}`);

    await findClosestAncestorPr(octokit, thisPullRequest);

    //console.log(`There are ${other.length} other pull requests`);

    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
