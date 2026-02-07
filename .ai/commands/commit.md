# Commit

- this guide describes how to commit 
**never** commit to master, if the current branch is master and a user asks you to commit, refuse and tell him he should checkout on a feature branch first.
- use git commit -m 'MESSAGE' to commit your changes.

## message pattern

- the base pattern of every commit message is: $category:($title):$description

- available categories are:
  - feat: new feature
  - fix: bug fix
  - refactor: code refactoring
  - perf: performance improvement
  - docs: documentation
  - test: testing
  - chore: maintenance
  - style: code style
  - build: build system
  - ci: continuous integration

- title should be the name of the feature, module, or file that was changed.
- description should be a short description of the changes made.