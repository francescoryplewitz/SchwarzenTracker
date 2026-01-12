## Frontend Tests Instruction 

- frontend tests are component wise 
- evaluate sensefull test cases for the component. Goal is 80% coverage.
- create a testing plan with all cases and show developer for approval
- before writing tests, analysze given component and extract every api interaction 
- all api interactions should be mocked, this means:
  1. extract server url for api call 
  2. start a local server instance by "npm run start:local"
  3. call endpoint and save response 
  4. this response belongs in frontend/tests/fixtures directory for usage while testing 
  5. to prevent subsequent discrepancy between client and server, write provider tests for each api interaction, take the response and create a matcher structure based on that.
  6. Matcher structures belong in test/provider/matchers directory
  7. After that write the provider tests against that matcher structure
  8. check provider tests by running "npm run test:provider"
- after mocking all api interactions start writing test 
- when youre done writing tests, check if tests are working properly by running "npm run test:frontend"

### general guideline for writing tests
- Exercise realistic user journeys: trigger all relevant actions via clicks, typing, option selection, or keyboard shortcuts; avoid calling component methods directly.  
- Verify the visible outcome in the DOM: texts, table rows, buttons, dialogs, and status indicators must reflect the expected state after each interaction.  
- Simulate success and error paths for every API call and confirm the user-facing feedback matches the scenario. 
- Cover alternative scenarios—empty data, large datasets, filter/sort combinations, disabled actions—so the component’s behavior under different conditions is validated.  
- Mock external dependencies thoughtfully but let the UI render as in production (minimize stubbing) to keep layout and controls observable.  
- Keep assertions focused on user-perceived results: ensure the UI updates correctly and that the right events are emitted after interactions, not just that services were invoked.
- **Consolidate tests per component:** Create exactly ONE test file per Vue component (e.g., `myComponent.spec.js` for `myComponent.vue`). Do not split tests for a single component across multiple files (like `.form.spec.js` vs `.logic.spec.js`). Use `describe` blocks within that single file to group tests logically (e.g., `describe('Calculations', ...)` and `describe('User Interactions', ...)`).
- **Simulate real user interactions:** NEVER call component methods directly (e.g., avoid `wrapper.vm.submitForm()`). Instead, always trigger the DOM event that a user would perform, such as `await wrapper.find('button.save-btn').trigger('click')` or `await input.trigger('blur')`. This ensures the UI elements (buttons, inputs) are actually accessible and functional.
- add missing UI hooks first: introduce meaningful `data-test` attributes or unique selectors in the Vue component **before** writing the spec whenever the DOM lacks stable hooks.
- when a component renders dialog/overlay content via Teleport (e.g. Quasar `QDialog`, menus, tooltips), always mount the spec with `attachTo: document.body`, and tear down the attached DOM after each test. This keeps teleported nodes inside the wrapper DOM tree so `wrapper.find('[data-test="…"]')` and user interactions behave consistently.
- `wrapper.vm`, direct method calls, or state mutation are forbidden; if a scenario cannot be tested via user interactions, change the implementation so the flow becomes testable without `wrapper.vm`.
- every API interaction (GET/POST/PATCH/DELETE) must have at least one success test **and** one failure test that asserts the actual UI response (notification, dialog state, table update, etc.).
- See "Stubbing Rules" section below for explicit guidance on when stubbing is appropriate.

### Stubbing Rules

**DO NOT stub Quasar components** - they work correctly with `mountWithQuasar`:
- `q-input`, `q-select`, `q-btn`, `q-checkbox`, `q-radio`, `q-toggle`
- `q-form` (use real validation behavior)
- `q-card`, `q-card-section`, `q-card-actions`
- `q-item`, `q-item-section`, `q-item-label`
- `q-icon`, `q-badge`, `q-chip`, `q-separator`, `q-space`
- `q-list`, `q-menu`
- `q-expansion-item` (use real expand/collapse behavior)
- `q-dialog` (use `attachTo: document.body` for teleported content)

**MAY stub only as last resort:**
- Complex third-party components with heavy external dependencies (NOT Quasar!)
- Custom components making their own API calls that you want to isolate from the parent test

**Rule: Quasar components should NEVER be stubbed.** If a test doesn't work with a real Quasar component, fix the test setup - don't stub the component.

**When stubbing custom/third-party components (NOT Quasar):**
- Keep slot content renderable (use `<slot />` in stub template)
- Preserve essential props (`modelValue`, `disable`, etc.)
- Emit the same events the real component would emit

**Bad example (unnecessary stubbing):**
```javascript
// DON'T do this - QSelect and QInput work fine without stubbing
const QSelectStub = defineComponent({
  props: { modelValue: null, options: Array },
  template: '<select :value="modelValue">...</select>'
})

const QInputStub = defineComponent({
  props: { modelValue: String },
  template: '<input :value="modelValue" @input="..." />'
})

// This loses real Quasar behavior: validation, focus, keyboard navigation, etc.
```

**Good example (no stubbing needed):**
```javascript
// DO this - use real Quasar components
const { wrapper } = mountWithQuasar(MyComponent, {
  attachTo: document.body  // for teleported content
})
// Real QInput validation, focus handling, etc. are tested
```

### Before You Stub: Troubleshooting Checklist

If a test fails with real Quasar components, try these steps **before** creating a stub:

1. **Teleported content not found?**
   - Add `attachTo: document.body` to mount options
   - Query the document directly: `document.querySelector('[data-test="..."]')`

2. **Async timing issues?**
   - Use `await flushPromises()` after interactions
   - Use `await waitFor(() => expect(...))` for async state changes
   - For debounced inputs: `vi.useFakeTimers()` + `vi.advanceTimersByTime()`

3. **Validation not triggering?**
   - Trigger blur: `await input.trigger('blur')`
   - Wait for validation: `await flushPromises()`

4. **Dialog/Menu not visible?**
   - Check if `v-model` is bound correctly
   - Ensure click handler is on the right element

5. **Still failing after all steps?**
   - For Quasar components: investigate further or ask for help - do NOT stub
   - For third-party components: only then consider a minimal stub with documented reason
- fixtures may be crafted from existing responses or realistic combinations. Document in the PR when no real backend payload was available, place the data under `frontend/tests/fixtures`, and make MSW/axios mocks consume those fixtures. Add a dedicated handler file under `frontend/tests/setup/handlers` to catch the frontend endpoints you mock (MSW), consistent with existing tests  
- every self-contained sub component with its own API or dialog logic (e.g. delete actions, uploaders) needs its **own** spec file. The parent spec only covers the integration, not the full sub-component flow.
- use English wording for `describe`/`it` descriptions in frontend specs and provider specs
- Do not try to evaluate Quasar notifications after user interactions. The notification array is asynchronous, and there is no guarantee that it will be populated immediately. Use other reliable methods to verify whether a user interaction has succeeded.

# Final Review 

- consider .ai/test-quality-review-prompt.md and make changes accordingly
- run provider and frontend tests yourself to ensure all tests are working properly. If tests are failing debug them yourself