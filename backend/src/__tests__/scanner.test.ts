import { describe, it, expect } from 'vitest';

// We'll test the pure transform functions, not the fs side
import { detectProjectType, parseGitRemote, inferDescription } from '../scanner';
import { normalizeContainerName } from '../docker';

describe('detectProjectType', () => {
  it('returns node when package.json exists', () => {
    expect(detectProjectType(['package.json', 'src'])).toBe('node');
  });
  it('returns python when requirements.txt exists', () => {
    expect(detectProjectType(['requirements.txt', 'main.py'])).toBe('python');
  });
  it('returns go when go.mod exists', () => {
    expect(detectProjectType(['go.mod', 'main.go'])).toBe('go');
  });
  it('returns other when no recognized files', () => {
    expect(detectProjectType(['README.md'])).toBe('other');
  });
});

describe('parseGitRemote', () => {
  it('converts SSH github remote to HTTPS', () => {
    const result = parseGitRemote('git@github.com:marttiku/devhub.git');
    expect(result).toEqual({ url: 'https://github.com/marttiku/devhub', provider: 'github' });
  });
  it('converts SSH gitlab remote to HTTPS', () => {
    const result = parseGitRemote('git@gitlab.omniva.tech:lab/bct.git');
    expect(result).toEqual({ url: 'https://gitlab.omniva.tech/lab/bct', provider: 'gitlab' });
  });
  it('handles HTTPS github remote', () => {
    const result = parseGitRemote('https://github.com/marttiku/devhub.git');
    expect(result).toEqual({ url: 'https://github.com/marttiku/devhub', provider: 'github' });
  });
  it('returns null for empty remote', () => {
    expect(parseGitRemote('')).toBeNull();
  });
});

describe('normalizeContainerName', () => {
  it('strips -service-N suffix (compose v2)', () => {
    expect(normalizeContainerName('honcho-api-1')).toBe('honcho');
    expect(normalizeContainerName('honcho-redis-1')).toBe('honcho');
    expect(normalizeContainerName('my-app-web-1')).toBe('my-app');
  });
  it('strips _service_N suffix (compose v1)', () => {
    expect(normalizeContainerName('myapp_web_1')).toBe('myapp');
  });
  it('strips leading slash', () => {
    expect(normalizeContainerName('/postgres')).toBe('postgres');
  });
  it('leaves standalone container names alone', () => {
    expect(normalizeContainerName('postgres')).toBe('postgres');
  });
});
