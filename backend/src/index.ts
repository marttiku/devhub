import express from 'express';
import * as http from 'http';
import * as path from 'path';
import { config } from './config';
import { initWebSocket } from './ws';
import { startPoller } from './poller';
import projectsRouter from './routes/projects';

const app = express();
app.use(express.json());

app.use('/api/projects', projectsRouter);

// Serve frontend static files
// __dirname = /app/backend/dist  → ../../ = /app → /app/frontend/dist
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

const server = http.createServer(app);
initWebSocket(server);

server.listen(config.apiPort, () => {
  console.log(`DevHub running on http://localhost:${config.apiPort}`);
  startPoller();
});
