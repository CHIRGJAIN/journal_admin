### Blog
- `POST /blog` (Bearer token)
- `GET /blog`
- `GET /blog/:id`
- `PUT /blog/:id` (Bearer token)
- `DELETE /blog/:id` (Bearer token)

**Fields:**
- title (String, required)
- description (Array of String, required)
- category (String, required)
- tags (Array of String)
- image (String, optional)
- isActive (Boolean, default true)
- createdAt, updatedAt (timestamps)
# JournalX Nexus Backend (Express + MongoDB)

## Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`.

```bash
cp .env.example .env
```

Run the API:

```bash
npm run start
# or
npm run start:dev

## Environment Variables
- `PORT`: API port (default `4000`).
- `MONGODB_URI`: MongoDB connection string.
- `JWT_EXPIRES_IN`: JWT expiration (default `60m`).



## Folder Structure

```
backend/
  .env
  .env.example
  .gitignore
  eslint.config.mjs
  output.log
  package-lock.json
  package.json
  README.md
  src/
    app.js
    server.js
    config/
      db.js
      env.js
      gcs-key.json
    controllers/
      auth.controller.js
      editorialBoard.controller.js
      issue.controller.js
      manuscripts.controller.js
      reviews.controller.js
    middleware/
      auth.js
      error-handler.js
      multer.js
    models/
      EditorialBoard.model.js
      Issue.model.js
      manuscript.model.js
      model-utils.js
      review.model.js
      user.model.js
    routes/
      auth.routes.js
      editorialBoard.routes.js
      index.js
      issue.routes.js
      manuscripts.routes.js
      reviews.routes.js
    services/
      auth.service.js
      editorialBoard.service.js
      issue.service.js
      manuscripts.service.js
      reviews.service.js
      users.service.js
    utils/
      async-handler.js
      gcs.js
      http-error.js
      object-id.js
```

## Database Connection

MongoDB is connected via Mongoose in `src/config/db.js` using `MONGODB_URI`.

## API Routes

### Health
- `GET /` ? `Hello World!`

### Auth
- `POST /auth/login`
  - Body: `{ email, password }`
  - Response: `{ access_token, user: { email, name, roles, expertise } }`
- `POST /auth/register`
  - Body: `{ email, password, name, roles, expertise }`
  - Response: created user
- `GET /auth/profile` (Bearer token)
  - Response: `{ userId, email, roles }`

### Manuscripts
- `GET /manuscripts/public`
- `GET /manuscripts/public/:id`
- `POST /manuscripts` (Bearer token)
- `GET /manuscripts` (Bearer token)
- `GET /manuscripts/my` (Bearer token)
- `GET /manuscripts/:id`

### Reviews
- `POST /reviews/assign` (Bearer token)
  - Body: `{ manuscriptId, reviewerId }`
- `PATCH /reviews/:id/submit` (Bearer token)
  - Body: `{ content, decision }`
- `GET /reviews/my` (Bearer token)
- `GET /reviews/manuscript/:id` (Bearer token)
```
https://cnsejournals.org

You are working in a Node.js + Express + MongoDB backend project.
IMPORTANT RULES:

Use the existing folder structure and file organization as shown below.
Follow the services + controllers pattern (no business logic in controllers).
Use asyncHandler for async routes only, not in controllers.
Use the same import/export style (require/module.exports).
Validate inputs as in existing modules.
Use the same error handling and response format.
Do not refactor or change existing code unless requested.
All new features, modules, or changes must fit into this structure:
Whenever I ask for a new feature, update, or module,
always use this structure and coding style.
Do not introduce new patterns or folders.
If you need to add something, show exactly where it goes in this structure.

