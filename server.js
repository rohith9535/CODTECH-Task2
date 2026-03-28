import { WebSocketServer } from "ws";

const PORT = process.env.WS_PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

function safeJson(data) {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(msg);
    }
  }
}

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    const parsed = safeJson(data);
    if (!parsed || !parsed.text) return;

    broadcast({
      id: parsed.id,
      user: parsed.user || "Anonymous",
      text: parsed.text,
      ts: parsed.ts || Date.now()
    });
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
