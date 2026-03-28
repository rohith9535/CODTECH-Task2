export const WS_URL =
  import.meta.env.VITE_WS_URL || "ws://localhost:8080";

export function createSocket(url, handlers = {}) {
  const ws = new WebSocket(url);

  ws.onopen = () => handlers.onOpen && handlers.onOpen();
  ws.onclose = () => handlers.onClose && handlers.onClose();
  ws.onerror = () => handlers.onError && handlers.onError();
  ws.onmessage = (event) => {
    let payload;
    try {
      payload = JSON.parse(event.data);
    } catch {
      payload = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        user: "Server",
        text: String(event.data),
        ts: Date.now()
      };
    }

    if (handlers.onMessage) {
      handlers.onMessage(payload);
    }
  };

  return ws;
}
