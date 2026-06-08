export function createEditorId() {
  return crypto.randomUUID();
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
