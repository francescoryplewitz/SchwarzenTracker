# Instructions for creating CRUD endpoints

## General

- Use a **meaningful path** for every new endpoint. Use **kebab-case** for the path (e.g. `/order-items`, `/project-settlement`).  
  If you are unsure, suggest a path and ask the user to confirm or adjust it.
- Always create **meaningful integration tests** for every new endpoint.  
  Follow the server test instructions in `AGENTS.md`.
- Use **meaningful logging**. Log what the endpoint is doing and include relevant identifiers (e.g. IDs) so issues can be traced easily.
- Always wrap **database operations that depend on user input** (e.g. query parameters, route parameters) in a `try/catch` block.  
  Request bodies for `POST`, `PATCH`, `PUT` are handled by the input validation middleware.
- Always use the **input validation middleware** to validate the request body:  
  `srv/server/input-validation-v2.js`

### Example validation

```js
validate({
  type: { type: 'STRING', required: true },
  positionSubtypeId: { type: 'STRING' },
  relation: { type: 'STRING', required: true },
  description: { type: 'STRING' },
  status: { type: 'STRING' },
  sum: { type: 'NUMBER' },
  legalEntityId: { type: 'STRING' }
})
```

---

## Create (POST)

- Always use **`POST`** to create new entries.
- On success, return the **created entry** with HTTP **status `201`**.
- Ask the user which fields are **required**.
- Ask the user whether any fields should have **default values**, and what those defaults are.

---

## Read (GET)

- Always use **`GET`** to retrieve entries.
- On success, return the **requested data** with HTTP **status `200`**.

### List vs. single entry

- Often you need:
  - A **list endpoint** (e.g. `GET /articles`)
  - A **single-item endpoint** (e.g. `GET /articles/:id`)
- If unsure, ask whether the user needs a list, a single GET, or both.

### Single entry GET

- Detail GET routes must contain an **ID parameter** (e.g. `GET /articles/:id`).
- If the entry does not exist, return **HTTP `404`**.

### List GET

- List endpoints usually require **filters**.  
  If none are provided, ask the user what filters should be available.
- Use **query parameters** for filters.
- Extract logic into helper functions:
  - `buildWhere` → filtering and search
  - `buildQuery` → sorting, pagination, includes, skip/take
- Add **pagination** support for list endpoints (`skip`, `take`, `limit`, `page`).

### Example GET structure

```js
const getArticleSearchQuery = (search) => [
  { title: { contains: search, mode: 'insensitive' } },
  { description: { contains: search, mode: 'insensitive' } }
]

const buildArticleWhere = (req) => {
  const { search } = req.query
  const where = {}
  if (search) buildEntitySearch(search, where, getArticleSearchQuery)
  return where
}

const buildArticleQuery = (req) => {
  const { skip, sortBy, desc } = req.query
  const validSortColumns = ['title', 'kek', 'unit']
  const where = buildArticleWhere(req)

  const orderBy = {}
  if (sortBy && validSortColumns.includes(sortBy)) {
    orderBy[sortBy] = desc === 'true' ? 'desc' : 'asc'
  } else {
    orderBy.title = 'asc'
  }

  return {
    where,
    orderBy,
    take: 30,
    skip: isNaN(parseInt(skip)) ? 0 : parseInt(skip)
  }
}

const getArticles = async (req, res) => {
  const { count } = req.query

  try {
    if (count) {
      const where = buildArticleWhere(req)
      const countQuery = await prisma.Article.count({ where })
      return res.status(200).send(`${countQuery}`)
    }

    const query = buildArticleQuery(req)
    const articles = await prisma.Article.findMany(query)

    return res.status(200).send(articles)
  } catch (e) {
    LOG.error('Could not get Articles')
    LOG.error(`Error is: ${e}`)
    return res.status(400).send()
  }
}
```

---

## Update (PATCH)

- Always use **`PATCH`** to update entries.
- On success, return the **updated entry** with HTTP **status `200`**.
- PATCH routes must contain an **ID parameter** (e.g. `PATCH /articles/:id`).
- Always **check if the entry exists** before updating.  
  If not, return **HTTP `404`**.
- When updating **foreign-key fields**, always validate the existence of the referenced entity.  
  Foreign keys may be corrupted → wrap checks in `try/catch`.
- Keep the handler short.  
  Either use a dedicated `buildPayload` helper or rely on the validated `req.body`.

---

## Delete (DELETE)

- Always use **`DELETE`** to delete entries.
- On success, return **HTTP `204`** with an empty response body.
- DELETE routes must contain an **ID parameter** (e.g. `DELETE /articles/:id`).
- Always check if the entry exists.  
  If not, return **HTTP `404`**.
- Always wrap delete operations in a **`try/catch`** block.
