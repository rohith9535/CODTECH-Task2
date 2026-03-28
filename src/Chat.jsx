import React, { useEffect, useMemo, useRef, useState } from "react";
import Message from "./Message.jsx";
import { createSocket, WS_URL } from "./websocket.js";

const STORAGE_KEY = "chat_messages";

function generateId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Chat({ username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("connecting");
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setMessages(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const ws = createSocket(WS_URL, {
      onOpen: () => setStatus("online"),
      onClose: () => setStatus("offline"),
      onError: () => setStatus("error"),
      onMessage: (payload) => {
        if (!payload || !payload.text) return;
        const incoming = {
          id: payload.id || generateId(),
          user: payload.user || "Anonymous",
          text: payload.text,
          ts: payload.ts || Date.now(),
          self: payload.user === username
        };

        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === incoming.id);
          if (exists) return prev;
          return [...prev, incoming];
        });
      }
    });

    wsRef.current = ws;

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [username]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const canSend = input.trim().length > 0;

  const statusLabel = useMemo(() => {
    if (status === "online") return "Live";
    if (status === "offline") return "Offline";
    if (status === "error") return "Error";
    return "Connecting";
  }, [status]);

  const handleSend = () => {
    if (!canSend) return;

    const message = {
      id: generateId(),
      user: username,
      text: input.trim(),
      ts: Date.now()
    };

    setMessages((prev) => [...prev, { ...message, self: true }]);
    setInput("");

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-card">
      <header className="chat-header">
        <div>
          <div className="chat-title">Realtime Chat</div>
          <div className="chat-subtitle">Signed in as {username}</div>
        </div>
        <div className={`status-badge status-${status}`}>{statusLabel}</div>
      </header>

      <section className="chat-body">
        {messages.length === 0 ? (
          <div className="empty-state">
            No messages yet. Start the conversation.
          </div>
        ) : (
          messages.map((msg) => (
            <Message key={msg.id} message={msg} isSelf={msg.self} />
          ))
        )}
        <div ref={bottomRef} />
      </section>

      <footer className="chat-input">
        <textarea
          className="message-input"
          placeholder="Type your message..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="send-button"
          onClick={handleSend}
          disabled={!canSend}
        >
          Send
        </button>
      </footer>
    </div>
  );
}
