import { describe, it, expect } from 'vitest';

// We'll test the pure transform functions, not the fs side
import { detectProjectType, parseGitRemote, inferDescription } from '../scanner';

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
