export type ProjectStatus = 'running' | 'stopped' | 'no-docker' | 'unknown';
export type ProjectType = 'node' | 'python' | 'go' | 'other';

export interface Container {
  containerName: string;
  groupName: string;
  status: string;
  health: 'healthy' | 'unhealthy' | 'starting' | 'none';
  ports: Array<{ hostPort: number; containerPort: number }>;
  image: string;
}

export interface GitRemote {
  url: string;
  provider: 'github' | 'gitlab' | 'other';
}

export interface Project {
  id: string;
  name: string;
  hostPath: string | null;
  containerPath: string | null;
  type: ProjectType;
  description: string;
  lastCommit: { relative: string; message: string } | null;
  gitRemote: GitRemote | null;
  branch: string | null;
  hasDockerCompose: boolean;
  hasDocker: boolean;
  containers: Container[];
  status: ProjectStatus;
  primaryPort: number | null;
}
