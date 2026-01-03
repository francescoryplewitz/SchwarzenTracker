# Instructions for Creating New Components

-   Always use the Composition API.

-   For loading indicators, use the loading utilities from
    `frontend/src/components/common/loading.js`, for example:

    ``` js
    // show loader with a meaningful user-facing message in German
    showLoader('Aussagekräftige Ladeanzeige für Nutzer')
    hideLoader()
    ```

-   Before writing formatting functions (e.g., for currencies), check
    for existing helper methods and reuse them instead of duplicating
    functionality.

-   Prefer Quasar utilities whenever possible. Only fall back to custom
    CSS if the desired result cannot be achieved with Quasar.

- if you have to display text fields which might be long for example description texts, use the expandable-description component

- Never use the `title` property for tooltips. Always use `q-tooltip` component instead. Wrap the tooltip inside the element (e.g., inside `q-btn`):
  ```vue
  <q-btn>
    <q-tooltip>Tooltip text</q-tooltip>
  </q-btn>
  ```

### create and edit

- Creation of entries is usually wrapped in a dialog containing a form and a save button.
- If not specified, ask the user how patch processes should be handled.  
  - In some cases, it is more appropriate to open the entire entry in a dialog and let the user edit it there (`dialog-patch`).  
  - In other cases, data is displayed in tables; then it can be reasonable to add an edit mode for a specific table row (`table-patch`).  
  See the view-specific instructions later in this file for details.
- Always use validation rules for input fields. Check `/common/input` to see which rules are available.
- Prevent saving data if validation rules are not met.
- Wrap inputs in a `q-form` and validate using `refVariable.value.validate()`. If validation fails, do **not** save the data.
- Do not use blur events (or similar) to trigger patch processes. Instead, watch the `v-model` object and trigger the patch with a debounce of 500 ms.

#### table-patch
- Integrate a classic read-only mode for table rows.
- Edit mode can be activated either by right-clicking on a table row or by clicking an edit button.
- Edit buttons must always be placed in the last column of the table, the "Actions" ("Aktionen") column.


### Client state updates after create/update

Do not trigger a full list reload after create or update operations. Avoid any “reload” events or redundant GET requests whose only purpose is to refresh UI data.

Create (POST):

Use the object returned by the server response and push it directly into the relevant client-side array/state.

The newly created entry must be injected into the existing collection without re-fetching the full list.

Update (PATCH/PUT):

Do not re-fetch the updated object from the server unless explicitly required.

In typical workflows, the edited object is already a reference to the item inside the client-side array. Once the user applies changes, the local instance is already up to date.

Only if the server returns additional computed fields or corrected values should the response be used to merge or patch the existing object — but never by pushing a new object into the array.

The UI must stay in sync by mutating the existing in-memory data, not by reconstructing lists from fresh server calls after every modification.

### Use object references across component boundaries

When opening dialogs or child components for creating or editing entries, always pass object references instead of cloning or creating new temporary objects.

For edit operations, the dialog should receive a direct reference to the item inside the parent list. Mutations performed inside the dialog must update the same referenced instance so that all components sharing that reference reflect the changes immediately.

Do not create detached copies of items unless explicitly required (e.g., for rollback scenarios). Detached objects break the reactive chain and force unnecessary state-management or manual synchronization work.

The goal is that updates propagate naturally through the component hierarchy by reference, avoiding redundant state containers or refresh calls.

# Autosave Interaction Rules

## A. Autosave Pattern (Standard)

-   The parent holds a reference to the original object (no cloning).
-   The child receives this reference and mutates the object directly.
-   No clones, no draft objects, and no merge logic.

## B. Event Emits Only When Explicitly Requested

-   Emit changes only when explicitly triggered (e.g., save/cancel
    flows).
-   Do **not** emit default `update:` events in autosave scenarios.

## C. Props Dogma Does Not Apply Here

The "props are read-only" rule is intentionally ignored when the use
case requires direct mutation.

Direct mutation is permitted if: - it is an autosave scenario, - the
parent is the single source of truth, - no cancel/draft functionality
exists.

# Prohibitions

## A. Internal Functions

**Forbidden:** - 3--5 pre-checks such as `if (!param) return`. - Type
checks for internal parameters. - Error suppression.

## B. Vue Components

**Forbidden:** - Cloning objects when direct editing of the parent
object is possible. - Complex update/merge methods in the parent. -
Event‑emit architectures without explicit need. - "Defensive" patterns
such as:\
`js   // creates an unnecessary local copy   const localCopy = JSON.parse(JSON.stringify(props.entry))`


# Style
- *never* use outlined or filled input fields
- buttons should always have a tooltip an be dense and flat
- prevent using custom css if its not absolutely necessary. Use Quasar utilities instead.