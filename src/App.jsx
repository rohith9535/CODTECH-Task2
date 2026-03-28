import React, { useEffect, useState } from "react";
import Chat from "./Chat.jsx";

const USER_KEY = "chat_username";

export default function App() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    let name = localStorage.getItem(USER_KEY) || "";
    if (!name) {
      name = (window.prompt("Enter a username") || "").trim();
      if (!name) {
        const suffix = Math.floor(Math.random() * 900 + 100);
        name = `Guest${suffix}`;
      }
      localStorage.setItem(USER_KEY, name);
    }
    setUsername(name);
  }, []);

  if (!username) {
    return (
      <div className="app-shell">
        <div className="loading">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Chat username={username} />
    </div>
  );
}
