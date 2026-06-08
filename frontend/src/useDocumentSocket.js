import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = import.meta.env.VITE_WS_URL ?? "/ws";

export function useDocumentSocket({ documentId, editorId, userName, onUpdate }) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [presence, setPresence] = useState([]);

  useEffect(() => {
    if (!documentId || !editorId || !userName) {
      return undefined;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 1000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/documents/${documentId}`, (message) => {
          onUpdate(JSON.parse(message.body));
        });
        client.subscribe(`/topic/documents/${documentId}/presence`, (message) => {
          setPresence(JSON.parse(message.body).users ?? []);
        });
        client.publish({
          destination: `/app/documents/${documentId}/join`,
          body: JSON.stringify({ editorId, userName })
        });
      },
      onWebSocketClose: () => setConnected(false),
      onStompError: () => setConnected(false)
    });

    client.activate();
    clientRef.current = client;

    return () => {
      setConnected(false);
      clientRef.current = null;
      client.deactivate();
    };
  }, [documentId, editorId, userName, onUpdate]);

  function sendEdit(content, baseVersion) {
    if (!clientRef.current?.connected) {
      return false;
    }

    clientRef.current.publish({
      destination: `/app/documents/${documentId}/edit`,
      body: JSON.stringify({
        editorId,
        userName,
        content,
        baseVersion,
        preview: content.slice(0, 60)
      })
    });

    return true;
  }

  return { connected, presence, sendEdit };
}
