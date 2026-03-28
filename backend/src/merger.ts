import type { FolderProject } from './scanner';
import type { DockerContainer } from './docker';

export type ProjectStatus = 'running' | 'stopped' | 'no-docker' | 'unknown';

export interface Project {
  id: string;
  name: string;
  hostPath: string | null;
  containerPath: string | null;
  type: string;
  description: string;
  lastCommit: FolderProject['lastCommit'];
  gitRemote: FolderProject['gitRemote'];
  branch: string | null;
  hasDockerCompose: boolean;
  hasDocker: boolean;
  containers: DockerContainer[];
  status: ProjectStatus;
  primaryPort: number | null;
}

function computeStatus(containers: DockerContainer[], dockerUnavailable = false): ProjectStatus {
  if (dockerUnavailable) return 'unknown';
  if (containers.length === 0) return 'no-docker';
  const anyUp = containers.some(c => c.status.startsWith('Up'));
  return anyUp ? 'running' : 'stopped';
}

function pickPrimaryPort(containers: DockerContainer[]): number | null {
  for (const c of containers) {
    const port = c.ports.find(p => p.hostPort !== 443)?.hostPort;
    if (port) return port;
  }
  return null;
}

export function mergeProjects(
  folders: FolderProject[],
  containers: DockerContainer[],
  dockerUnavailable = false,
): Project[] {
  const projects = new Map<string, Project>();

  // Seed from folder scan
  for (const f of folders) {
    const matched = containers.filter(c => c.groupName.toLowerCase() === f.id.toLowerCase());
    const status = dockerUnavailable ? 'unknown' : computeStatus(matched);
    projects.set(f.id, {
      id: f.id,
      name: f.name,
      hostPath: f.hostPath,
      containerPath: f.containerPath,
      type: f.type,
      description: f.description,
      lastCommit: f.lastCommit,
      gitRemote: f.gitRemote,
      branch: f.branch,
      hasDockerCompose: f.hasDockerCompose,
      hasDocker: f.hasDockerCompose || matched.length > 0,
      containers: matched,
      status,
      primaryPort: pickPrimaryPort(matched),
    });
  }

  // Add Docker-only cards (containers without matching folder)
  const folderIds = new Set(folders.map(f => f.id.toLowerCase()));
  const orphanGroups = new Map<string, DockerContainer[]>();
  for (const c of containers) {
    if (!folderIds.has(c.groupName.toLowerCase())) {
      const grp = orphanGroups.get(c.groupName) || [];
      grp.push(c);
      orphanGroups.set(c.groupName, grp);
    }
  }
  for (const [groupName, grpContainers] of orphanGroups) {
    projects.set(groupName, {
      id: groupName,
      name: groupName,
      hostPath: null,
      containerPath: null,
      type: 'other',
      description: '',
      lastCommit: null,
      gitRemote: null,
      branch: null,
      hasDockerCompose: false,
      hasDocker: true,
      containers: grpContainers,
      status: computeStatus(grpContainers, dockerUnavailable),
      primaryPort: pickPrimaryPort(grpContainers),
    });
  }

  return Array.from(projects.values()).sort((a, b) => a.name.localeCompare(b.name));
}
