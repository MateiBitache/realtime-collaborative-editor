# README For Me

This file explains how the project works so I can talk about it clearly in an interview.

## Project Structure

```text
realtime-collaborative-editor/
  backend/
    Dockerfile
    pom.xml
    src/main/java/com/example/collabeditor/
      CollabEditorApplication.java
      document/
        CreateDocumentRequest.java
        Document.java
        DocumentController.java
        DocumentNotFoundException.java
        DocumentRepository.java
        DocumentResponse.java
        DocumentService.java
        EditResult.java
        UpdateTitleRequest.java
      websocket/
        DocumentSocketController.java
        DocumentUpdateMessage.java
        EditMessage.java
        JoinMessage.java
        PresenceMessage.java
        PresenceService.java
        PresenceUser.java
        SocketDisconnectListener.java
        WebSocketConfig.java
    src/main/resources/
      application.yml
    src/test/
      java/com/example/collabeditor/document/
        DocumentControllerTest.java
        DocumentServiceTest.java
      resources/
        application-test.yml
  frontend/
    Dockerfile
    index.html
    nginx.conf
    package.json
    vite.config.js
    src/
      api.js
      conflict.js
      conflict.test.js
      editorSession.js
      main.jsx
      styles.css
      useDocumentSocket.js
  docker-compose.yml
  README.md
  README_FOR_ME.md
```

## Important Backend Files

`CollabEditorApplication.java` starts the Spring Boot app.

`Document.java` is the JPA entity. It stores the document id, title, content, version, created time, and updated time.

`DocumentRepository.java` gives basic database operations through Spring Data JPA.

`DocumentService.java` contains the main document logic. It creates documents, loads documents, renames documents, and applies edits.

`DocumentController.java` exposes the REST API for creating, listing, loading, and renaming documents.

`WebSocketConfig.java` enables STOMP over WebSockets. The frontend connects to `/ws`, sends messages to `/app`, and receives broadcasts from `/topic`.

`DocumentSocketController.java` receives WebSocket messages for joining a document and editing a document.

`PresenceService.java` tracks which WebSocket sessions are connected to each document.

`SocketDisconnectListener.java` removes a user from presence when their WebSocket session closes.

## Important Frontend Files

`main.jsx` is the main React app. It shows the document list, editor, status, and active users.

`api.js` contains the REST calls to the backend.

`useDocumentSocket.js` creates the STOMP client, subscribes to document topics, and sends edit messages.

`conflict.js` decides whether an incoming update should replace the current editor text and what status message to show.

`editorSession.js` creates a browser editor id and stores the display name in local storage.

`styles.css` contains the app layout and UI styling.

`nginx.conf` serves the built React app and proxies backend traffic in Docker.

## How The Frontend Connects To The Backend

The frontend uses REST first. When the page loads, it calls `GET /api/documents` to show existing documents. When I create a document, it calls `POST /api/documents`. When I open a document, it calls `GET /api/documents/{id}`.

After a document is opened, `useDocumentSocket.js` connects to `/ws` with SockJS and STOMP. It subscribes to two topics:

- `/topic/documents/{documentId}` for document content updates
- `/topic/documents/{documentId}/presence` for active editor updates

Then it publishes a join message to:

```text
/app/documents/{documentId}/join
```

## How A Document Is Created, Loaded, Edited, And Saved

Create:

1. The user enters a title.
2. React calls `createDocument(title)`.
3. The backend creates a `Document` entity with empty content and version `0`.
4. The backend saves it with JPA and returns the document response.

Load:

1. The user clicks a document.
2. React calls `loadDocument(id)`.
3. The backend returns the saved title, content, and version.
4. React puts the content into the textarea.

Edit:

1. The user types in the textarea.
2. React waits briefly so it does not send a message for every single keystroke.
3. React sends a WebSocket edit message with `content`, `editorId`, `userName`, and `baseVersion`.
4. The backend checks the version.
5. If the version matches, it saves the content and increments the version.
6. The backend broadcasts the new state to everyone on the document topic.

Save:

The save happens on the backend every time an edit is accepted. There is no separate save button.

## WebSocket Message Flow

Join flow:

```text
React -> /ws
React -> /app/documents/{documentId}/join
Spring -> PresenceService
Spring -> /topic/documents/{documentId}/presence
React -> updates active editors
```

Edit flow:

```text
React textarea changes
React -> /app/documents/{documentId}/edit
Spring -> DocumentSocketController
Spring -> DocumentService.edit()
Spring -> database save if version matches
Spring -> /topic/documents/{documentId}
React clients -> update editor state
```

## How Real-Time Updates Are Broadcast

The backend uses `SimpMessagingTemplate`. When an edit is accepted, the backend sends a `DocumentUpdateMessage` to:

```text
/topic/documents/{documentId}
```

Every browser that opened that document is subscribed to the same topic, so every browser receives the update.

## How Basic Conflict Handling Works

Each document has a version number. The frontend includes the version it last saw when it sends an edit.

Example:

1. Browser A and Browser B both have version `3`.
2. Browser A sends an edit with base version `3`.
3. The backend saves it and the document becomes version `4`.
4. Browser B sends an edit that was still based on version `3`.
5. The backend sees that `3` is stale and does not save Browser B's text.
6. The backend broadcasts the latest version with `conflict: true`.
7. Browser B reloads the latest saved text.

This is basic conflict handling. It does not merge text like Google Docs, but it prevents older text from overwriting newer saved text.

## What I Learned

- REST is better for normal request-response actions like create and load.
- WebSockets are better for live updates after users are already inside a document.
- The backend should be the source of truth for shared state.
- Version numbers are a simple way to detect stale edits.
- Docker Compose makes the demo easier because the app has one browser URL.

## Hardest Parts

The hardest part is understanding that the textarea is local state, but the saved document is backend state. The frontend can type immediately, but the backend decides what is actually saved.

The other tricky part is WebSocket routing. REST endpoints look like normal URLs, but STOMP has destinations like `/app/documents/{id}/edit` and topics like `/topic/documents/{id}`.

## How To Explain This In An Interview

I would explain it like this:

This is a small collaborative editor. I used REST for creating and loading documents because those are normal request-response operations. Once a document is opened, the frontend connects to the Spring Boot backend with STOMP over WebSockets. Each edit sends the full document content and the version the client last saw. The backend checks the version, saves the edit if it is current, increments the version, and broadcasts the new state to everyone editing that document. Presence is tracked by WebSocket session id, so users can see who else is connected.

I kept conflict handling simple on purpose. If a client sends an edit based on an old version, the backend rejects that edit and sends back the latest saved document. That makes the behavior understandable and prevents stale edits from overwriting newer work.

## Interview Questions And Answers

Q: Why did you use both REST and WebSockets?

A: REST is simpler and clearer for creating, listing, and loading documents. WebSockets are useful after a document is open because edits and presence changes need to be pushed to other users in real time.

Q: Where is the source of truth?

A: The backend is the source of truth. The frontend keeps local textarea state for responsiveness, but the backend version and saved content decide the final document state.

Q: How do you prevent conflicts?

A: Each document has a version number. Every edit includes the version the client last saw. If the backend has a different version, the edit is stale and is not saved.

Q: Why send the full content instead of text operations?

A: Sending full content keeps the project understandable. For a student project, it shows synchronization and conflict detection without adding a complex operational transform or CRDT system.

Q: What would you improve next?

A: I would add authentication, document permissions, PostgreSQL, edit history, and better conflict merging. For a production editor, I would use a real collaboration algorithm instead of whole-content updates.

Q: How is presence handled?

A: When a user joins a document, the backend stores their WebSocket session id with their display name. When the session disconnects, the backend removes them and broadcasts the new presence list.

Q: How is persistence handled?

A: The backend uses Spring Data JPA and H2. In Docker, the H2 file is stored in a Docker volume, so documents remain available after restarting containers.
