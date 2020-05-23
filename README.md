# Merge request train

This action automatically updates your merge requests to make chained
pull requests easier. It will also auto-merge pull requests when
they are approved and CI is OK.

## Specification

This action runs on every pull request update.

When you create a pull request, it will:
1) Update the base branch for this pull request to be the closest
ancestor branch which is also a pull request.
2) For every pull request which this branch is an ancestor branch
of, update the base branch if this pull request is the closest
ancestor.

On every push, it will:
1) For every pull request that targets this branch, merge this
branch to the relevant pull request. If that fails, post a message
asking the user to merge manually.

When you approve a pull request, the CI is complete, or when a pull request is merged:
1) Check if the pull request can be merged

### When will I merge a PR

The three conditions must be met:
1) CI ok
2) Approved
3) Target branch is not itself a PR

The PR will always be merged via squash
