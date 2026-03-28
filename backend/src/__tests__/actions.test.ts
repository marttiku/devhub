import { describe, it, expect } from 'vitest';
import { buildOpenUrl } from '../actions';

describe('buildOpenUrl', () => {
  it('builds localhost URL from port', () => {
    expect(buildOpenUrl(3000)).toBe('http://localhost:3000');
  });
  it('returns localhost:80 when port is null', () => {
    expect(buildOpenUrl(null)).toBe('http://localhost:80');
  });
});
