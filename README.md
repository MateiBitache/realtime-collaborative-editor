# Real Time Collaborative Editor

Real Time Collaborative Editor is a simple full stack project built with React and Spring Boot. It lets multiple users open the same document, type together, see who is connected, and keep the document saved so it can be reopened later.

The goal is not to clone Google Docs. The goal is to show a clear, understandable implementation of REST APIs, WebSockets, shared state, synchronization, persistence, and basic conflict handling.

## Why I Built It

I built this project to practice the kind of backend and frontend integration that appears in real products. A collaborative editor is a good example because it needs normal REST endpoints for document management and real-time WebSocket messages for live updates.

## Main Features

- Create and open documents through a REST API
- Edit a document in the browser
- Broadcast document changes to other connected users
- Show active editors for the current document
- Save document content in H2 through Spring Data JPA
- Reopen saved documents later
- Use version numbers for simple conflict handling
- Run the whole project with Docker Compose
- Backend and frontend tests

## Architecture

The project has three main parts:

- `frontend`: React app built with Vite
- `backend`: Spring Boot API with REST, WebSockets, JPA, and H2
- `docker-compose.yml`: runs the backend and serves the frontend through Nginx

In Docker, the React app is served by Nginx at `http://localhost:3000`. Nginx also proxies `/api` and `/ws` to the Spring Boot backend.

## REST And WebSockets

REST is used for document lifecycle actions:

- `POST /api/documents` creates a document
- `GET /api/documents` lists documents
- `GET /api/documents/{id}` loads one document
- `PATCH /api/documents/{id}/title` renames a document

WebSockets are used after a document is opened:

- The frontend connects to `/ws`
- A user joins a document through `/app/documents/{documentId}/join`
- Edits are sent to `/app/documents/{documentId}/edit`
- Document updates are broadcast on `/topic/documents/{documentId}`
- Presence updates are broadcast on `/topic/documents/{documentId}/presence`

## Real-Time Synchronization

Each document has a `version` field. When the frontend sends an edit, it includes the version it last saw. If the backend version still matches, the backend saves the new content, increments the version, and broadcasts the update.

Other users receive the update and replace their editor content with the latest saved state.

## Conflict Handling

Conflict handling is intentionally simple. If an edit is sent with an old version number, the backend does not overwrite the current saved document. Instead, it broadcasts the latest document state with a conflict flag. The client that sent the stale edit reloads the saved text.

This is not advanced merging, but it is easy to explain and prevents older edits from silently replacing newer work.

## Document Persistence

Documents are stored with Spring Data JPA in an H2 database. In Docker Compose, the database file is stored in a named volume, so documents can still be opened after the containers restart.

## Tech Stack

- React
- Vite
- Spring Boot
- Spring Web
- Spring WebSocket
- Spring Data JPA
- H2 database
- STOMP over SockJS
- Docker Compose
- Nginx
- JUnit
- Vitest

## Run Locally

Run the full app with Docker:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3000
```

For local development without Docker:

```bash
cd frontend
npm install
npm run dev
```

Run the backend with Java 21 and Maven:

```bash
cd backend
mvn spring-boot:run
```

## Test It

Frontend:

```bash
cd frontend
npm test
```

Backend:

```bash
cd backend
mvn test
```

If Maven is not installed locally, the backend can still be built through Docker Compose.

## Demo Flow

1. Start the project with `docker compose up --build`.
2. Open `http://localhost:3000` in two browser windows.
3. Create a document in the first window.
4. Open the same document in the second window.
5. Change the user name in one window.
6. Type in either window.
7. Watch the other window update in real time.
8. Refresh the page and reopen the document to show persistence.
9. Type quickly in both windows to show the version-based conflict handling.

## What I Learned

- How to separate REST responsibilities from WebSocket responsibilities
- How STOMP topics can broadcast updates to users viewing the same document
- How shared state needs a single source of truth on the backend
- How version numbers can prevent stale updates from overwriting newer text
- How to connect a React app to a Spring Boot backend in both development and Docker

## Future Improvements

- Add user accounts
- Add document permissions
- Add richer text formatting
- Store edit history
- Add better merge handling for simultaneous edits
- Replace H2 with PostgreSQL
- Add end-to-end tests for the two-window editing flow
