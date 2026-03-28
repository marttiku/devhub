import { scanProjects } from './scanner';
import { listContainers, isDockerAvailable } from './docker';
import { mergeProjects, type Project } from './merger';
import { broadcast } from './ws';
import { config } from './config';

let currentProjects: Project[] = [];

export function getProjects(): Project[] {
  return currentProjects;
}

export async function poll() {
  const [folders, containers, dockerOk] = await Promise.all([
    scanProjects(),
    listContainers(),
    isDockerAvailable(),
  ]);
  currentProjects = mergeProjects(folders, containers, !dockerOk);
  broadcast({ type: 'projects', data: currentProjects });
}

export function startPoller() {
  void poll(); // immediate
  setInterval(() => {
    void poll();
  }, config.scanIntervalMs);
}
