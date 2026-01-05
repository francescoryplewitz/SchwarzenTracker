# Instructions for creating new database models

- Use **Prisma** for all data modelling.
- Always use **singular** names for models (e.g. `User`, `Order`, `Invoice`).
- If the user does **not** provide a model structure (properties and types), ask them for a specification. Do **not** make assumptions.
- Always ask whether any properties should have **default values**, and clarify what those defaults should be.
- always ask user wheter properties are required or optional.
- Relations in Prisma Schema must be named in plural when they are arrays (e.g. `settlements Settlement[]` instead of `Settlement Settlement[]`), as Prisma automatically creates relations and these should be named in plural to follow the convention.

