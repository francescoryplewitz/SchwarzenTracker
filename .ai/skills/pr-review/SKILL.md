---
name: pr-review
description: Perform structured pull request reviews for staged changes, uncommitted changes, or diffs between branches/commits. Use this skill when the user asks for PR review, code review, merge-readiness checks, or issue discovery before merge.
---

# PR Review Skill

## Goal
Run a consistent PR review and report findings with clear priority and actionable fixes.

## Required Scope Handling
1. Ask what to review if scope is missing.
2. Support these scopes:
   - staged changes
   - uncommitted changes
   - diff between two branches
   - diff between two commits

## Required Context Checks
1. Always read `AGENTS.md` or `CLAUDE.md` first.
2. Read linked instruction files relevant to the review task.
3. Apply all discovered project-specific rules during the review.

## Issue Categories
Classify every finding into one category:
1. `Bugs` - Code that will not work as intended
2. `Security` - Potential vulnerabilities
3. `Performance` - Inefficient code or avoidable overhead
4. `Code Style` - Violations of style rules from project instructions
5. `Code Smells` - Maintainability/readability/complexity issues
6. `Usability` - Critical UX gaps
7. `Tests` - Missing or insufficient test coverage

## Criticality Levels
- `Blocker` - Must be fixed before merge
- `High` - Should be fixed before merge
- `Medium` - Should be addressed, merge still possible
- `Low` - Optional improvement

## Output Format
Always structure the review in this order:
1. `Summary`
   - Keep it short
   - Include positive aspects
2. `Issues Table`
   - Columns: `Criticality`, `Category`, `File/Line`, `Description`
3. `Recommendations`
   - Minimal patch suggestions for blocker/high findings
   - Additional non-mandatory suggestions

## No-Issue Case
If no issues are found:
- Say explicitly that no issues were found
- Congratulate the author
- Highlight what was done well
