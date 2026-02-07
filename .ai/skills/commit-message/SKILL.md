---
name: commit-message
description: Create and validate Git commit commands and commit messages using the pattern $category:($title):$description. Use this skill when handling commit requests, commit message format questions, category selection, or preparing a commit command.
---

# Commit Message Skill

## Goal
Create a correct commit command with a message in the required format.

## Workflow
1. Check the current branch.
2. If the branch is `master`, refuse the commit and tell the user to switch to a feature branch.
3. Select the correct category from:
   - `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `style`, `build`, `ci`
4. Create `title` as the feature name, module name, or changed file name.
5. Create a short `description` of the concrete change.
6. Build the message exactly like this:
   - `$category:($title):$description`
7. Output the commit command like this:
   - `git commit -m 'MESSAGE'`

## Rules
- Never commit on `master`.
- Always use the required commit message pattern.
- Use only categories from the allowed list.
- Keep `title` short and specific.
- Keep `description` short and precise.

## Quick Examples
- `fix:(workouts):corrects rest time calculation`
- `feat:(workoutSummary):shows total volume in summary card`
- `docs:(commit-guide):adds message format and categories`
