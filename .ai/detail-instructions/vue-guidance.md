# Vue Guidance

## 1. Page & Component Architecture

### Concept

```
┌─────────────────────────────────────────────────────┐
│  PAGE (e.g., CustomerPage.vue)                      │
│  - Thin wrapper, minimal template                   │
│  - Holds reactive state (arrays, objects)           │
│  - Fetches data on mount                            │
│  - Passes references to child components            │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐                 │
│  │  Component A │  │  Component B │                 │
│  │  (Header)    │  │  (Table)     │                 │
│  │              │  │              │                 │
│  │  - Display   │  │  - Receives  │                 │
│  │    only      │  │    list ref  │                 │
│  │              │  │  - Mutates   │                 │
│  │              │  │    directly  │                 │
│  └──────────────┘  └──────────────┘                 │
│                    ┌──────────────┐                 │
│                    │  Component C │                 │
│                    │  (Dialog)    │                 │
│                    │              │                 │
│                    │  - Receives  │                 │
│                    │    item ref  │                 │
│                    │  - Mutates   │                 │
│                    │    directly  │                 │
│                    └──────────────┘                 │
└─────────────────────────────────────────────────────┘
```

### Pages

Pages are **thin orchestration layers**. They:

- Live in `src/pages/`
- Are registered in the router
- Hold the **single source of truth** for data (reactive arrays/objects)
- Fetch data once on mount
- Pass **references** (not copies) to child components
- Contain minimal template code - delegate UI to components

```vue
<!-- src/pages/CustomerPage.vue -->
<template>
  <div class="q-pa-md">
    <customer-header />
    <customer-table :customers="customers" @create="openCreateDialog" />
    <customer-dialog ref="dialogRef" :customers="customers" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import CustomerHeader from 'components/customer/customerHeader.vue'
import CustomerTable from 'components/customer/customerTable.vue'
import CustomerDialog from 'components/customer/customerDialog.vue'

export default {
  name: 'CustomerPage',
  components: { CustomerHeader, CustomerTable, CustomerDialog },
  setup() {
    const customers = ref([])
    const dialogRef = ref(null)

    onMounted(async () => {
      const { data } = await api.get('/customers')
      customers.value = data
    })

    const openCreateDialog = () => dialogRef.value.open()

    return { customers, dialogRef, openCreateDialog }
  }
}
</script>
```

### Components

Components are **reusable UI building blocks**. They:

- Live in `src/components/` (organized by feature)
- Receive data as **props** (references, not copies)
- **Mutate the received references directly** - no cloning, no emitting back
- Handle user interactions and API calls
- Push new items directly into received arrays after POST
- Are unaware of routing or global app state

```vue
<!-- src/components/customer/customerTable.vue -->
<template>
  <q-table :rows="customers" :columns="columns">
    <template #body-cell-actions="props">
      <q-td>
        <q-btn flat dense icon="edit" @click="edit(props.row)">
          <q-tooltip>Edit</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CustomerTable',
  props: {
    customers: { type: Array, required: true }
  },
  emits: ['create'],
  setup(props, { emit }) {
    const columns = [/* ... */]

    const edit = (customer) => {
      // customer IS the reference from parent's array
      // mutations here update the parent automatically
    }

    return { columns, edit }
  }
})
</script>
```

### Data Flow Rules

1. **Page owns the data** - only the page calls the initial GET
2. **Components receive references** - never clone props
3. **Mutations propagate automatically** - editing `props.customer.name` updates the parent
4. **POST results get pushed** - after creating, push the response directly into the array
5. **No reload after changes** - never re-fetch lists after create/update/delete
6. **No emit chains for data** - data flows by reference, not by events

### When to Create a Component

Extract into a component when:
- UI section is **reusable** across pages
- Logic is **self-contained** (table, form, dialog)
- Template exceeds ~50 lines
- You need **testability** in isolation

Keep in page when:
- Logic is page-specific and small
- Extraction would create unnecessary indirection


## 2. Creating Pages

If not specified, ask the developer at which path the new page should be placed.

### 2.1 Light Theme Pages (Quasar Standard)

For admin/desktop pages using the standard Quasar light theme:

```vue
<q-card class="bg-grey-1 q-mb-md">
  <q-card-section class="q-mb-md">
    <div class="row items-center q-gutter-sm">
      <div class="q-mr-md">
        <q-avatar square size="xl" class="bg-grey-2" style="border-radius: 10px;">
          <q-icon name="$FITTING_ICON" />
        </q-avatar>
      </div>
      <div class="text-h6">
        $PAGE_TITLE
      </div>
      <q-space />
      $ADDITIONAL_CONTENT
    </div>
  </q-card-section>
</q-card>
```

The rest of the content should be placed in another `q-card`.

### 2.2 Dark Theme Pages (Mobile App)

For mobile app pages with glassmorphism design, use this pattern. **Copy the complete template and CSS exactly** - do not improvise spacing values.

#### Global Theme Classes (from `theme-dark.scss`)

- `.dark-page` - Dark background with gradient
- `.glass-card` - Glassmorphism card with blur effect
- `.accent-box` - Turquoise icon box with border (14px border-radius)

#### Template Structure

```vue
<template>
  <div class="PAGENAME-page dark-page">
    <div class="content-container">
      <header class="page-header">
        <div class="header-icon accent-box">
          <q-icon name="$ICON" size="24px" />
        </div>
        <div class="header-text">
          <h1 class="page-title">$TITLE</h1>
          <p class="page-subtitle">$SUBTITLE</p>
        </div>
        <!-- Optional: Action button -->
        <button class="header-action-btn" @click="doAction">
          <q-icon name="mdi-plus" size="20px" />
          <q-tooltip>Tooltip text</q-tooltip>
        </button>
      </header>

      <!-- Page content with .glass-card -->
      <div class="content-card glass-card">
        ...
      </div>
    </div>
  </div>
</template>
```

#### Required CSS (copy exactly!)

```scss
<style scoped>
.content-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 16px 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
  margin-top: 16px;
  line-height: 1.1;
}

.page-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin: 2px 0 0 0;
}

.header-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(0, 255, 194, 0.1);
  border: 1px solid rgba(0, 255, 194, 0.2);
  color: #00ffc2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-action-btn:hover {
  background: rgba(0, 255, 194, 0.2);
}
</style>
```

#### Important Notes

- **Do not change spacing values** - they are carefully calibrated
- **Always use `.dark-page`** as the root class
- **Use `.glass-card`** for content sections (not `q-card`)
- **Subtitle is optional** - remove `.header-text` wrapper if no subtitle needed


## 3. Creating Components

- Always use the **Composition API**
- ESLint requires **multi-word component names** (`vue/multi-word-component-names`)

### Loading Indicators

Use the loading utilities from `frontend/src/components/common/loading.js`:

```js
showLoader('Loading customers...')
hideLoader()
```

### Existing Helpers

Before writing formatting functions (e.g., for currencies), check for existing helper methods and reuse them instead of duplicating functionality.

### Tooltips

Never use the `title` attribute for tooltips. Always use `q-tooltip` wrapped inside the element:

```vue
<q-btn flat dense icon="edit">
  <q-tooltip>Edit entry</q-tooltip>
</q-btn>
```

### Long Text Fields

For displaying text fields that might be long (e.g., description texts), use the `expandable-description` component.

### Quasar First

Prefer Quasar utilities whenever possible. Only fall back to custom CSS if the desired result cannot be achieved with Quasar.


## 4. Forms & Validation

### Create Pattern

Creation of entries is wrapped in a dialog containing a form and a save button.

### Edit Patterns

If not specified, ask the user how patch processes should be handled:

- **dialog-patch**: Open the entire entry in a dialog for editing
- **table-patch**: Add an edit mode for a specific table row
  - Integrate a classic read-only mode for table rows
  - Edit mode can be activated by right-clicking a row or clicking an edit button
  - Edit buttons must be in the last column ("Actions" / "Aktionen")

### Validation

- Always use validation rules for input fields
- Check `/common/input` to see which rules are available
- Prevent saving data if validation rules are not met
- Wrap inputs in a `q-form` and validate using `refVariable.value.validate()`

```js
const save = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return
  // proceed with save
}
```

### Autosave

Do not use blur events to trigger patch processes. Instead, watch the `v-model` object with a 500ms debounce:

```js
import { watch } from 'vue'
import { debounce } from 'quasar'

const debouncedPatch = debounce(async () => {
  await api.patch(`/items/${props.item.id}`, props.item)
}, 500)

watch(() => props.item, debouncedPatch, { deep: true })
```


## 5. Client State Management

### Autosave Pattern (Standard)

- The parent holds a reference to the original object (no cloning).
- The child receives this reference via props.
- The child creates a local ref using `toRef()` or `ref()` and mutates that.
- No clones, no draft objects, and no merge logic.

### Working with Props Correctly

**NEVER mutate `props.X` directly.** Vue props are read-only by design.

Instead, create a reactive reference in the child component:

```js
// Option 1: toRef (keeps reactivity link to parent)
const item = toRef(props, 'item')

// Option 2: ref (for objects passed by reference)
const items = ref(props.items)

// Now you can mutate:
item.value.name = 'New Name'        // Parent sees this change
items.value.push(newEntry)          // Parent sees this change
```

**Why this works:** JavaScript objects are passed by reference. When you do `ref(props.items)`, you're not cloning - you're creating a reactive wrapper around the same object. Mutations to properties inside that object propagate to the parent.

### Event Emits Only When Explicitly Requested

- Emit changes only when explicitly triggered (e.g., save/cancel flows).
- Do **not** emit default `update:` events in autosave scenarios.

### Object References Across Boundaries

When opening dialogs or child components for creating or editing entries, always pass object references instead of cloning.

For edit operations, the dialog receives a direct reference to the item inside the parent list. Mutations performed inside the dialog update the same referenced instance.

Do not create detached copies unless explicitly required (e.g., for rollback scenarios).

### After POST (Create)

Use the object returned by the server response and push it directly into the array:

```js
const create = async (newItem) => {
  const { data } = await api.post('/items', newItem)
  props.items.push(data)
  dialog.value = false
}
```

### After PATCH/PUT (Update)

Do not re-fetch the updated object. The edited object is already a reference to the item inside the array - it's already up to date.

Only merge the response if the server returns computed fields:

```js
const update = async () => {
  const { data } = await api.patch(`/items/${item.id}`, item)
  Object.assign(item, data) // merge computed fields
}
```

### After DELETE

Remove the item from the array by index or filter - never reload the full list.


## 6. Prohibitions

### ESLint Rules Are Never Disabled

**NEVER use `// eslint-disable` comments.** If ESLint complains, the code pattern is wrong.

Common mistake:
```js
// BAD - never do this
// eslint-disable-next-line vue/no-mutating-props
props.items.push(newItem)
```

Correct approach:
```js
// GOOD
const items = ref(props.items)
items.value.push(newItem)
```

### Internal Functions

**Forbidden:**
- Pre-checks like `if (!param) return`
- Type checks for internal parameters
- Error suppression

### Vue Components

**Forbidden:**
- Cloning objects when direct editing is possible
- Complex update/merge methods in the parent
- Event-emit architectures without explicit need
- Defensive patterns like:

```js
// WRONG - creates unnecessary local copy
const localCopy = JSON.parse(JSON.stringify(props.entry))
```

### Props Dogma Exception

The "props are read-only" rule is intentionally ignored when:
- It is an autosave scenario
- The parent is the single source of truth
- No cancel/draft functionality exists


## 7. Style

- **Never** use outlined or filled input fields
- Buttons should always have a tooltip and be `dense` and `flat`
- Prefer Quasar utilities over custom CSS


## 8. Asset Imports

When importing static assets (images, fonts, etc.) in Vue components:

- **DO NOT** use `@/` alias for asset paths in `src` attributes
- **DO** import assets as ES modules using relative paths:

```vue
<template>
  <img :src="logoUrl" alt="Logo" />
</template>

<script>
import logoUrl from '../static/logo.png'

export default {
  setup() {
    return { logoUrl }
  }
}
</script>
```

This ensures Vite correctly resolves and bundles the asset with proper cache-busting hashes.
