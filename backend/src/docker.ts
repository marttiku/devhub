import Dockerode from 'dockerode';

const docker = new Dockerode({ socketPath: '/var/run/docker.sock' });

export interface DockerContainer {
  groupName: string; // normalized: honcho-api-1 → honcho
  containerName: string; // raw name: honcho-api-1
  status: string; // Up 5 minutes / Exited (1) ...
  health: 'healthy' | 'unhealthy' | 'starting' | 'none';
  ports: Array<{ hostPort: number; containerPort: number }>;
  image: string;
}

/** Strip service-N suffix: honcho-api-1 → honcho, my-app-web-1 → my-app */
export function normalizeContainerName(raw: string): string {
  return raw
    .replace(/^\//, '')
    .replace(/-[a-z0-9]+-\d+$/, '')
    .replace(/_[a-z0-9]+_\d+$/, '');
}

export async function listContainers(): Promise<DockerContainer[]> {
  try {
    const containers = await docker.listContainers({ all: true });
    return containers.map((c) => {
      const rawName = c.Names[0] || '';
      const groupName = normalizeContainerName(rawName);
      const health =
        c.Status.includes('healthy') && !c.Status.includes('unhealthy')
          ? 'healthy'
          : c.Status.includes('unhealthy')
            ? 'unhealthy'
            : c.Status.includes('starting')
              ? 'starting'
              : 'none';
      const ports = (c.Ports || [])
        .filter((p) => p.PublicPort && p.PrivatePort)
        .map((p) => ({
          hostPort: p.PublicPort!,
          containerPort: p.PrivatePort!,
        }));
      return {
        groupName,
        containerName: rawName.replace(/^\//, ''),
        status: c.Status,
        health,
        ports,
        image: c.Image,
      };
    });
  } catch (err) {
    console.error('[docker] Failed to list containers:', err);
    return [];
  }
}

export async function isDockerAvailable(): Promise<boolean> {
  try {
    await docker.ping();
    return true;
  } catch {
    return false;
  }
}
