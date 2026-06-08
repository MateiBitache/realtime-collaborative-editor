const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? "Request failed");
  }

  return response.json();
}

export function listDocuments() {
  return request("/api/documents");
}

export function createDocument(title) {
  return request("/api/documents", {
    method: "POST",
    body: JSON.stringify({ title })
  });
}

export function loadDocument(id) {
  return request(`/api/documents/${id}`);
}

export function renameDocument(id, title) {
  return request(`/api/documents/${id}/title`, {
    method: "PATCH",
    body: JSON.stringify({ title })
  });
}
