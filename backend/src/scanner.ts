import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { config, containerPathToHost } from './config';

export type ProjectType = 'node' | 'python' | 'go' | 'other';

export interface GitRemote {
  url: string;
  provider: 'github' | 'gitlab' | 'other';
}

export interface FolderProject {
  id: string;
  name: string;
  hostPath: string;
  containerPath: string;
  type: ProjectType;
  description: string;
  lastCommit: { relative: string; message: string } | null;
  gitRemote: GitRemote | null;
  branch: string | null;
  hasDockerCompose: boolean;
}

export function detectProjectType(files: string[]): ProjectType {
  if (files.includes('package.json')) return 'node';
  if (files.includes('requirements.txt') || files.includes('pyproject.toml')) return 'python';
  if (files.includes('go.mod')) return 'go';
  return 'other';
}

export function parseGitRemote(raw: string): GitRemote | null {
  if (!raw) return null;
  let url = raw.trim();
  try {
    const sshMatch = url.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
    if (sshMatch) {
      url = `https://${sshMatch[1]}/${sshMatch[2]}`;
    } else {
      url = url.replace(/\.git$/, '');
    }
    const parsedHost = new URL(url).hostname;
    const provider = parsedHost === 'github.com' ? 'github'
      : parsedHost.includes('gitlab') ? 'gitlab'
      : 'other';
    return { url, provider };
  } catch {
    return null;
  }
}

export function inferDescription(containerPath: string): string {
  try {
    const pkgPath = path.join(containerPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.description) return pkg.description;
    }
    const readmePath = path.join(containerPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      const lines = fs.readFileSync(readmePath, 'utf8').split('\n');
      const first = lines.find(l => l.trim() && !l.startsWith('#'));
      if (first) return first.trim().slice(0, 120);
    }
  } catch { /* ignore */ }
  return '';
}

function gitExec(cwd: string, args: string[]): string {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', timeout: 3000 }).trim();
  } catch {
    return '';
  }
}

export async function scanProjects(): Promise<FolderProject[]> {
  const root = config.containerProjectsPath;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const projects: FolderProject[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    const containerPath = path.join(root, name);
    const hostPath = containerPathToHost(containerPath);

    let files: string[] = [];
    try { files = fs.readdirSync(containerPath); } catch { continue; }

    const type = detectProjectType(files);
    const description = inferDescription(containerPath);
    const hasDockerCompose = files.some(f => f.startsWith('docker-compose') && (f.endsWith('.yml') || f.endsWith('.yaml')));

    const branch = gitExec(containerPath, ['rev-parse', '--abbrev-ref', 'HEAD']) || null;
    const rawRemote = gitExec(containerPath, ['remote', 'get-url', 'origin']);
    const gitRemote = parseGitRemote(rawRemote);

    const rawLog = gitExec(containerPath, ['log', '-1', '--format=%ar|||%s']);
    let lastCommit: FolderProject['lastCommit'] = null;
    if (rawLog) {
      const [relative, ...msgParts] = rawLog.split('|||');
      lastCommit = { relative: relative.trim(), message: msgParts.join('|||').trim() };
    }

    projects.push({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      hostPath,
      containerPath,
      type,
      description,
      lastCommit,
      gitRemote,
      branch,
      hasDockerCompose,
    });
  }

  return projects;
}
