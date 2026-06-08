package com.example.collabeditor.websocket;

import com.example.collabeditor.document.DocumentService;
import com.example.collabeditor.document.EditResult;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class DocumentSocketController {
    private final DocumentService documentService;
    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    public DocumentSocketController(
            DocumentService documentService,
            PresenceService presenceService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.documentService = documentService;
        this.presenceService = presenceService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/documents/{documentId}/join")
    public void join(
            @DestinationVariable UUID documentId,
            @Valid JoinMessage message,
            SimpMessageHeaderAccessor headers
    ) {
        presenceService.join(documentId, headers.getSessionId(), message);
    }

    @MessageMapping("/documents/{documentId}/edit")
    public void edit(@DestinationVariable UUID documentId, @Valid EditMessage message) {
        EditResult result = documentService.edit(documentId, message.content(), message.baseVersion());
        DocumentUpdateMessage update = result.conflict()
                ? DocumentUpdateMessage.conflict(result.document(), message)
                : DocumentUpdateMessage.saved(result.document(), message);
        messagingTemplate.convertAndSend("/topic/documents/" + documentId, update);
    }
}
