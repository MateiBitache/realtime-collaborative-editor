import React from "react";
import { createRoot } from "react-dom/client";
import { FileText, Plus, RefreshCw, Users } from "lucide-react";
import { createDocument, listDocuments, loadDocument } from "./api";
import { statusFromUpdate, shouldApplyIncomingUpdate } from "./conflict";
import { createEditorId, defaultUserName, saveUserName } from "./editorSession";
import { useDocumentSocket } from "./useDocumentSocket";
import "./styles.css";

function App() {
  const [documents, setDocuments] = React.useState([]);
  const [document, setDocument] = React.useState(null);
  const [title, setTitle] = React.useState("Interview Notes");
  const [content, setContent] = React.useState("");
  const [version, setVersion] = React.useState(0);
  const [status, setStatus] = React.useState("Open or create a document");
  const [userName, setUserName] = React.useState(defaultUserName);
  const [editorId] = React.useState(createEditorId);
  const saveTimer = React.useRef(null);
  const latestVersion = React.useRef(0);

  const handleUpdate = React.useCallback((update) => {
    latestVersion.current = update.version;
    setVersion(update.version);
    setStatus(statusFromUpdate(update, editorId));

    if (shouldApplyIncomingUpdate(update, editorId)) {
      setContent(update.content);
    }
  }, [editorId]);

  const { connected, presence, sendEdit } = useDocumentSocket({
    documentId: document?.id,
    editorId,
    userName,
    onUpdate: handleUpdate
  });

  React.useEffect(() => {
    refreshDocuments();
  }, []);

  async function refreshDocuments() {
    const data = await listDocuments();
    setDocuments(data);
  }

  async function handleCreate(event) {
    event.preventDefault();
    const created = await createDocument(title);
    setDocuments((current) => [created, ...current.filter((item) => item.id !== created.id)]);
    openDocument(created.id);
  }

  async function openDocument(id) {
    const loaded = await loadDocument(id);
    setDocument(loaded);
    setContent(loaded.content);
    setVersion(loaded.version);
    latestVersion.current = loaded.version;
    setStatus("Document loaded");
  }

  function handleNameChange(event) {
    setUserName(saveUserName(event.target.value));
  }

  function handleContentChange(event) {
    const nextContent = event.target.value;
    setContent(nextContent);
    setStatus("Typing...");

    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const sent = sendEdit(nextContent, latestVersion.current);
      setStatus(sent ? "Saving..." : "Waiting for connection");
    }, 250);
  }

  return (
    <main className="app">
      <aside className="sidebar">
        <div className="brand">
          <FileText size={24} />
          <div>
            <h1>Real Time Collaborative Editor</h1>
            <span>React + Spring Boot</span>
          </div>
        </div>

        <label className="field">
          <span>Your name</span>
          <input value={userName} onChange={handleNameChange} maxLength={40} />
        </label>

        <form className="create-form" onSubmit={handleCreate}>
          <label className="field">
            <span>New document</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} />
          </label>
          <button type="submit">
            <Plus size={18} />
            Create
          </button>
        </form>

        <div className="list-heading">
          <span>Documents</span>
          <button className="icon-button" type="button" onClick={refreshDocuments} aria-label="Refresh documents">
            <RefreshCw size={17} />
          </button>
        </div>

        <div className="document-list">
          {documents.map((item) => (
            <button
              type="button"
              key={item.id}
              className={document?.id === item.id ? "document-row active" : "document-row"}
              onClick={() => openDocument(item.id)}
            >
              <span>{item.title}</span>
              <small>v{item.version}</small>
            </button>
          ))}
          {documents.length === 0 && <p className="empty">No documents yet.</p>}
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{connected ? "Connected" : "Not connected"}</p>
            <h2>{document?.title ?? "Choose a document"}</h2>
          </div>
          <div className="status">
            <span>{status}</span>
            <strong>v{version}</strong>
          </div>
        </header>

        <div className="editor-layout">
          <textarea
            value={content}
            onChange={handleContentChange}
            disabled={!document}
            placeholder="Create or open a document, then start typing."
          />

          <aside className="presence">
            <div className="presence-title">
              <Users size={18} />
              <span>Active editors</span>
            </div>
            {presence.map((user) => (
              <div className="presence-row" key={user.editorId}>
                <span>{user.userName.slice(0, 1).toUpperCase()}</span>
                <p>{user.userName}</p>
              </div>
            ))}
            {presence.length === 0 && <p className="empty">Open a document to see editors.</p>}
          </aside>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
