export function createEditorId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `editor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function defaultUserName() {
  const saved = localStorage.getItem("editorUserName");
  if (saved) {
    return saved;
  }
  const name = `Student ${Math.floor(Math.random() * 900 + 100)}`;
  localStorage.setItem("editorUserName", name);
  return name;
}

export function saveUserName(name) {
  const trimmed = name.trim();
  if (trimmed) {
    localStorage.setItem("editorUserName", trimmed);
  }
  return trimmed;
}
