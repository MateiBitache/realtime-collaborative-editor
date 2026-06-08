package com.example.collabeditor.websocket;

import java.util.List;
import java.util.UUID;

public record PresenceMessage(
        UUID documentId,
        List<PresenceUser> users
) {
}
