import { describe, it, expect } from 'vitest';
import { mergeProjects } from '../merger';
import type { FolderProject } from '../scanner';
import type { DockerContainer } from '../docker';

const baseFolder: FolderProject = {
  id: 'honcho', name: 'honcho', hostPath: '/Coding/honcho',
  containerPath: '/projects/honcho', type: 'other', description: '',
  lastCommit: null, gitRemote: null, branch: 'main', hasDockerCompose: true,
};

const apiContainer: DockerContainer = {
  groupName: 'honcho', containerName: 'honcho-api-1',
  status: 'Up 5 minutes (healthy)', health: 'healthy',
  ports: [{ hostPort: 8001, containerPort: 8000 }], image: 'honcho:latest',
};

const redisContainer: DockerContainer = {
  groupName: 'honcho', containerName: 'honcho-redis-1',
  status: 'Up 5 minutes (healthy)', health: 'healthy',
  ports: [{ hostPort: 6379, containerPort: 6379 }], image: 'redis:8.2',
};

describe('mergeProjects', () => {
  it('merges folder with matching containers', () => {
    const result = mergeProjects([baseFolder], [apiContainer, redisContainer]);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('running');
    expect(result[0].containers).toHaveLength(2);
  });

  it('folder with no containers → no-docker', () => {
    const result = mergeProjects([baseFolder], []);
    expect(result[0].status).toBe('no-docker');
  });

  it('Docker-only container (no matching folder) → card with id', () => {
    const result = mergeProjects([], [apiContainer, redisContainer]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('honcho');
    expect(result[0].status).toBe('running');
  });

  it('stopped containers → stopped', () => {
    const stopped = { ...apiContainer, status: 'Exited (0) 2 hours ago', health: 'none' as const };
    const result = mergeProjects([baseFolder], [stopped]);
    expect(result[0].status).toBe('stopped');
  });

  it('hasDocker true when hasDockerCompose=true even with no containers', () => {
    const result = mergeProjects([baseFolder], []);
    expect(result[0].hasDocker).toBe(true);
  });
});
