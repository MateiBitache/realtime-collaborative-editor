package com.example.collabeditor.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PresenceService {
    private final SimpMessagingTemplate messagingTemplate;
    private final Map<UUID, Map<String, PresenceUser>> usersByDocument = new HashMap<>();
    private final Map<String, UUID> documentBySession = new HashMap<>();

    public PresenceService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public synchronized PresenceMessage join(UUID documentId, String sessionId, JoinMessage message) {
        usersByDocument.computeIfAbsent(documentId, key -> new HashMap<>())
                .put(sessionId, new PresenceUser(message.editorId(), message.userName()));
        documentBySession.put(sessionId, documentId);
        return broadcast(documentId);
    }

    public synchronized void leave(String sessionId) {
        UUID documentId = documentBySession.remove(sessionId);
        if (documentId == null) {
            return;
        }
        Map<String, PresenceUser> users = usersByDocument.get(documentId);
        if (users == null) {
            return;
        }
        users.remove(sessionId);
        if (users.isEmpty()) {
            usersByDocument.remove(documentId);
        }
        broadcast(documentId);
    }

    public synchronized PresenceMessage snapshot(UUID documentId) {
        List<PresenceUser> users = new ArrayList<>(usersByDocument.getOrDefault(documentId, Map.of()).values());
        users.sort(Comparator.comparing(PresenceUser::userName));
        return new PresenceMessage(documentId, users);
    }

    private PresenceMessage broadcast(UUID documentId) {
        PresenceMessage message = snapshot(documentId);
        messagingTemplate.convertAndSend("/topic/documents/" + documentId + "/presence", message);
        return message;
    }
}
