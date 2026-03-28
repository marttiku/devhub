import * as path from 'path';

export const config = {
  hostCodingRoot: process.env.HOST_CODING_ROOT || '/Users/martti.kuldma/Coding',
  containerProjectsPath: process.env.CONTAINER_PROJECTS_PATH || '/projects',
  apiPort: parseInt(process.env.API_PORT || '4242', 10),
  hostHelperPort: parseInt(process.env.HOST_HELPER_PORT || '4243', 10),
  scanIntervalMs: parseInt(process.env.SCAN_INTERVAL_MS || '60000', 10),
  hostHelperBase: `http://host.docker.internal:${process.env.HOST_HELPER_PORT || 4243}`,
};

export function containerPathToHost(containerPath: string): string {
  // Use path.relative to safely strip the container prefix regardless of trailing slashes
  const rel = path.relative(config.containerProjectsPath, containerPath);
  return path.join(config.hostCodingRoot, rel);
}
