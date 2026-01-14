# Agent instructions

**Important** Never under any cicumstances leave the project directory. Always stay in the project directory. Never execute commands outside, it is never the appropriate approach to solve any issue. 

- never try to resolve issues regarding to prisma migrations. ask me to do it.

**Comment Language**  
  - All comments in your test code should be written in **English**.


## code style
- use camelCase for variables and functions
- use PascalCase for classes
- use kebab-case for file names in ./srv directory
- use camelCase for file names in ./frontend directory
- use single quotes for strings
- do not use semicolons if not absolutly necessary
- if you write messages for users, write this messages in german and use "Du". No formal speech like "Sie".
- never use nested try catch blocks. use single try catch block instead.
- avoid bloated methods — break complex logic into small, single-purpose helper functions.
- No defensive programming in internal code.
    Internal functions within the same file or module must not perform null checks, type checks, or similar defensive validations.
    If an internal call passes invalid data, the code is allowed to crash — this is intentional and helps reveal integration issues immediately.
    All validation is performed strictly at system boundaries (e.g., user input, API requests), never inside internal logic.

## frontend code style
- note eslint rules of vue components: should always have multi-word  names. vue/multi-word-component-names
- if you have to create a new page, use the instructions in .ai/detail-instructions/new-pages-guidance.md
- if you have to create a new component, use the instructions in .ai/detail-instructions/component-guidance.md
- if you need icons, try to find standard icons definitions for your case in .ai/detail-instructions/icon-map.md
- if you need colors, try to find standard colors definitions for your case in .ai/detail-instructions/color-schema.md

## backend code style
- if you have to cretae CRUD operation endpoints, use the instructions in .ai/detail-instructions/crud-operations.md
- tests database models by using guidance at .ai/detail-instructions/db-model-guidance.md


## automated tests
- tests frontend components by using guidance at .ai/detail-instructions/frontend-tests-guidance.md
- tests backend components by using guidance at .ai/detail-instructions/srv-tests-guidance.md

## PR instructions
- write a short title which describes the changes you made. title should be 3 words at max 

## Branch instructions
- do not use extra long branch names. keep it short and descriptive.

## Commit instructions
- use npm run commit to commit your changes and follow cli instructions afterwards 


# Final Review & Target State Guidelines

## Final Review (Simplicity Pass)

Apply this strictly after completion:

-   Remove all unnecessary checks, clones, abstractions, wrappers, andx
    intermediate steps.
-   Remove anything that is not strictly required for the described
    functionality.
-   If a solution consists of more code elements than necessary while a
    simpler alternative exists → simplify.

## Target State (What We Always Aim For)

-   Minimum code, maximum clarity.
-   No unnecessary safety mechanisms.
-   Few files, few functions, no complexity without clear benefit.
-   Direct mutation paths are standard when they are functionally
    appropriate and technically stable.

## Lint
- when your done run npm run lint to fix any linting errors