# PR Review

This file describes requirements for reviewing a PR.
> If the user did not tell you what you have to review, ask him. A pr review can be created for staged changes,  uncommitted changes or for diff between two specific branches or commits.
> *ALWAYS* check the existing AGENTS.md or CLAUDE.md file to see base instructions. There are linked md files which describe specific instructions for your task, take these instructions into account as well!

## Categories
Categorize every issue you find into one of the following categories:
1. **Bugs** - Code which will not work as intended
2. **Security** - Potential security vulnerabilities
3. **Performance** - Inefficient code that could cause performance issues
4. **Code Style** - Violations of the code style rules defined in AGENTS.md
5. **Code Smells** - Maintainability, readability, unnecessary complexity (see "Final Review & Target State Guidelines")
6. **Usability** - UX issues where the developer missed something critical for a great user experience
7. **Tests** - Missing or insufficient test coverage

## Criticality Levels
- **Blocker** - Must be fixed before merge
- **High** - Should be fixed before merge
- **Medium** - Should be addressed, but can be merged
- **Low** - Nice to have, optional improvement

## Output Format
Always use this structure when reviewing a PR:

1. **Summary** - Provide a short summary to give the user a first feeling how the review went. Include positive aspects!
2. **Issues Table** - Create a table with columns: Criticality, Category, File/Line, Description
3. **Recommendations**:
   - Suggested patches for blocker/high issues (provide minimal code fixes)
   - Other suggestions which are not mandatory

If no issues are found, congratulate the author and highlight what was done well.
