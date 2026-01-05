## Test instructions
- if you change code in ./srv folder, consider if it would be helpful to write a test for it.
- test coverage threshold is 80%
- run tests by npm run test:ci 
- after text execution you get a c8 coverage table, analyze it and decide if critical areas are not covered
- tests are base on mocha, do not run npx mocha directly. Use npm run test:ci instead and set relevant tests or describe blocks to .only so not all tests running while debugging
- check ./test/setup.js, have in mind what globals are existing 
- check ./test/server.js, have in mind what methods are available on the server object
- Don't use server.reset excessively after every test step. If you need fresh data, run the reset specifically within the test that requires it — not automatically after each one.
- run the tests locally, debug any issues, fix the errors you find, and repeat the process until all suites are stable and passing
- if you write tests for a new database model add the new model in the data generator reset statement

## Unit Tests vs. Integration Tests

### When to Use Unit Tests?

Unit Tests are suitable for isolated functions and services without HTTP communication:
- Pure logic functions (helpers, utilities, calculations)
- Service logic with database operations (Prisma queries)
- Data transformations and formatting
- Validation functions

**Examples**: Helper functions in `srv/common/`, service methods that use Prisma directly

**Example structure:**
```js
const { expect } = require('chai')
const helper = require('../../srv/common/helper')
const prisma = require('../../srv/data/prisma')

describe('Helper functions', () => {
  describe('buildSelectorFromQuery', () => {
    it('should build selector with valid columns', () => {
      const result = helper.buildSelectorFromQuery('name,email,id', ['name', 'email', 'id', 'phone'])
      expect(result).to.deep.equal({ name: true, email: true, id: true })
    })
  })
})
```

### When to Use Integration Tests?

Integration Tests are for complete API endpoints and request/response cycles:
- HTTP endpoints (GET, POST, PATCH, DELETE)
- Complete request/response cycles
- Authentication and authorization
- End-to-end workflows via HTTP

**Examples**: API endpoints in `srv/routes/`, complete service integrations via HTTP

**Example structure:**
```js
const { expect } = require('chai')
const { GET, POST, PATCH, DELETE } = server.httpOperations()

describe('resource related tests', () => {
  before(async function () {
    await server.checkConnection()
    await server.reset()
    server.setService('/api')
    server.setAuth({ username: 'testuser', password: 'password' })
  })
  it('should create new resource', async () => {
    const result = await POST('/resource', {
      name: 'Test Resource',
      email: 'test@example.com'
    })
    expect(result).to.have.status(201)
  })
})
```

## Technologies Used

Only the following technologies may be used:
- **mocha** - Test runner
- **chai** (expect, chai-http, chai-subset) - Assertion library
- **c8** - Code coverage tool
- **Prisma** - Database client (always use real database, no mocking!)

**Important**: Do not use other test frameworks (jest, vitest) or mocking libraries (sinon).

## File Naming Convention

- **No `.test.js` suffixes** - Files are named e.g. `helper.js` instead of `helper.test.js`
- File names should match the existing integration test structure (kebab-case: `input-validation.js`)

## Mocking Guidelines

### Prisma/Database
- **Never mock** - Unit Tests use the real database just like Integration Tests
- Prisma is imported directly: `const prisma = require('../../srv/data/prisma')`

### Server-registered Globals
- Globals like `global.Logger`, `global.graphEventQueue` etc. that are registered in the server setup (`srv/server.js`) must be mocked in Unit Tests, since the server is not running
- Example for Logger mock:
  ```js
  global.Logger = class {
    constructor() {}
    info() {}
    error() {}
    // ... other methods
  }
  ```

### Other Dependencies
- Dependencies should preferably not be mocked
- Only mock if absolutely unavoidable
- If mocking is necessary, provide a clear comment in the test explaining why the mocking is required

## Integration Tests

### Server Object

- A global `server` object is defined and accessible in all test files.  
- The `server` object wraps a class that manages and controls key aspects of the application server.  
- It provides convenient methods to simplify and standardize common testing operations.

### Core Capabilities

- Provides methods for sending and handling HTTP requests to the application server.  
- Simplifies API interaction within tests.
- Includes built-in functionality to configure and manage Basic Authentication credentials.
- Offers helper methods to create commonly used data entities for your domain models
- These methods automate repetitive data setup tasks.
- Allows test authors to focus on the actual test logic rather than setup procedures.
- The `server` object is automatically available in all tests.  
- Implementation is located at: `test/server.js`

### Important Notes on ExpressJS and JavaScript Behavior

- **404 for Nonexistent Routes**  
  - When calling a route that does not exist, ExpressJS returns a **404** status.  
  - Example:  
    ```js
    it('should fail if resourceId is missing', async () => {
        const result = await GET(`/resource//subresource?param=value`)
        expect(result).to.have.status(400)
    })
    ```
    - In this case, `//` means the `resourceId` is missing.  
    - Express cannot match the endpoint and therefore responds with **404**, not **400**.

- **Falsy Empty Strings**  
  - In JavaScript, `if ('')` evaluates to **false** — an empty string is considered *falsy*.

- **Input Validation**  
  - The Express server includes input validation via the `validate()` function defined in the route configuration.  
  - Common rules (e.g., string length ≤ 250 characters) are already enforced there.  
  - **Do not** repeatedly test these validation constraints in every scenario.

- **Authentication Tests**  
  - Skip detailed authentication checks in this context.  
  - You do **not** need to test for `401` responses when a user is undefined.  
  - Do **not** explicitly test which user roles lack permissions unless explicitly requested.  
  - The `authorize` method already defines which roles are allowed for each route.

- **Prisma Restriction**  
  - Prisma cannot be used within the test wrapper (applies only to Integration Tests, not Unit Tests).

- **Ignored Extra Properties**  
  - If a request includes properties not defined in the route's `validate` schema, they are automatically filtered out.  
  - These have **no effect** on endpoint behavior.
