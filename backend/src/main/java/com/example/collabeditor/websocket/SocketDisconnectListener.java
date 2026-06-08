package com.example.collabeditor.websocket;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class SocketDisconnectListener {
    private final PresenceService presenceService;

    public SocketDisconnectListener(PresenceService presenceService) {
        this.presenceService = presenceService;
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        presenceService.leave(event.getSessionId());
    }
}
