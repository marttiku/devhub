import { execFile } from 'child_process';
import { promisify } from 'util';
import { config } from './config';

const execFileAsync = promisify(execFile);

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export function buildOpenUrl(port: number | null): string {
  return `http://localhost:${port ?? 80}`;
}

export async function startProject(containerPath: string): Promise<ActionResult> {
  try {
    await execFileAsync('docker', ['compose', '-f', `${containerPath}/docker-compose.yml`, 'up', '-d'], {
      timeout: 60_000,
    });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || 'docker compose up failed' };
  }
}

export async function stopProject(containerPath: string): Promise<ActionResult> {
  try {
    await execFileAsync('docker', ['compose', '-f', `${containerPath}/docker-compose.yml`, 'down'], {
      timeout: 60_000,
    });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || 'docker compose down failed' };
  }
}

async function callHelper(endpoint: string, body: object): Promise<ActionResult> {
  const url = `${config.hostHelperBase}${endpoint}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const json = await res.json() as ActionResult;
    return json;
  } catch (err: any) {
    return { ok: false, error: 'Host helper offline — restart devhub-helper with pm2' };
  }
}

export async function openInBrowser(url: string): Promise<ActionResult> {
  return callHelper('/open-browser', { url });
}

export async function openInCursor(hostPath: string): Promise<ActionResult> {
  return callHelper('/open-cursor', { path: hostPath });
}

/** Poll until all containers are healthy (or Up with no healthcheck), or timeout. Returns true if ready. */
export async function waitForHealthy(
  getContainers: () => Promise<{ health: string; status: string }[]>,
  timeoutMs = 30_000,
  intervalMs = 500,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  // If no healthchecks defined on any container, wait 5s flat then check if they're Up
  const initial = await getContainers();
  if (initial.length > 0 && initial.every(c => c.health === 'none')) {
    await new Promise(r => setTimeout(r, 5_000));
    const check = await getContainers();
    return check.some(c => c.status.startsWith('Up'));
  }

  while (Date.now() < deadline) {
    const containers = await getContainers();
    if (containers.length === 0) break;
    if (containers.every(c => c.health === 'healthy' || (c.health === 'none' && c.status.startsWith('Up')))) return true;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return false;
}
