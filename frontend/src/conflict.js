export function shouldApplyIncomingUpdate(update, editorId) {
  return update.editorId !== editorId || update.conflict;
}

export function statusFromUpdate(update, editorId) {
  if (update.conflict && update.editorId === editorId) {
    return "Your edit was based on an older version. The editor reloaded the latest saved text.";
  }

  if (update.editorId === editorId) {
    return "Saved";
  }

  return `${update.userName} updated the document`;
}
