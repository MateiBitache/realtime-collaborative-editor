package com.example.collabeditor.document;

public record EditResult(
        DocumentResponse document,
        boolean saved,
        boolean conflict
) {
    public static EditResult saved(DocumentResponse document) {
        return new EditResult(document, true, false);
    }

    public static EditResult conflict(DocumentResponse document) {
        return new EditResult(document, false, true);
    }
}
