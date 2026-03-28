import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { Server } from 'http';

let wss: WebSocketServer | undefined;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });
  wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
    console.log('[ws] client connected');
    ws.on('close', () => console.log('[ws] client disconnected'));
  });
}

export function broadcast(data: unknown) {
  if (!wss) return;
  const payload = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
