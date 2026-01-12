# Reusable Prompt for Test Quality Evaluation

Use this prompt to regularly evaluate the quality of your frontend tests.

```text
Analyze my current changes regarding frontend testing.
Please evaluate the tests for the affected components honestly and critically based on the following criteria:

1. **Realism & User Simulation:**
   - Are real user interactions simulated (clicks, inputs) or are methods called directly (e.g., `wrapper.vm...`)?
   - Are realistic data (fixtures) used?
   - Will the tests fail if buttons in the UI are disabled or hidden?

2. **Structure & Maintainability:**
   - Is there exactly ONE test file per component?
   - Are the tests logically grouped (using `describe` blocks)?
   - Is the setup code (mocks, mounts) DRY (Don't Repeat Yourself)?

3. **Business Value & Stability:**
   - Are we just testing "that it renders" or are we validating critical business logic (calculations, validations, API error handling)?
   - Do these tests sustainably help prevent regressions during future refactorings?

**Analysis Task:**
Read the code of the test files AND the corresponding Vue components to answer this.

**Output Format:**
- **Overall Assessment:** (Short & punchy: Top, Solid, or Needs Improvement)
- **Strengths:** What was implemented well?
- **Weaknesses / Risks:** Where do the tests deviate from best practices (e.g., method calls instead of events)?
- **Concrete Action Items:** What should I do now to lift the tests to the next level?
```

