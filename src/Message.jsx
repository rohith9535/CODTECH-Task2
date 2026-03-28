import React from "react";

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Message({ message, isSelf }) {
  return (
    <div className={`msg-row ${isSelf ? "self" : "other"}`}>
      <div className={`bubble ${isSelf ? "bubble-self" : "bubble-other"}`}>
        <div className="msg-meta">
          <span className="msg-user">{message.user}</span>
          <span className="msg-time">{formatTime(message.ts)}</span>
        </div>
        <p className="msg-text">{message.text}</p>
      </div>
    </div>
  );
}
