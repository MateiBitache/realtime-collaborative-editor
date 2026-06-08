package com.example.collabeditor.websocket;

import com.example.collabeditor.document.DocumentResponse;

import java.time.Instant;
import java.util.UUID;

public record DocumentUpdateMessage(
        UUID documentId,
        String editorId,
        String userName,
        String content,
        long version,
        boolean saved,
        boolean conflict,
        String message,
        Instant updatedAt
) {
    public static DocumentUpdateMessage saved(DocumentResponse document, EditMessage editMessage) {
        return new DocumentUpdateMessage(
                document.id(),
                editMessage.editorId(),
                editMessage.userName(),
                document.content(),
                document.version(),
                true,
                false,
                "saved",
                document.updatedAt()
        );
    }

    public static DocumentUpdateMessage conflict(DocumentResponse document, EditMessage editMessage) {
        return new DocumentUpdateMessage(
                document.id(),
                editMessage.editorId(),
                editMessage.userName(),
                document.content(),
                document.version(),
                false,
                true,
                "conflict",
                document.updatedAt()
        );
    }
}
