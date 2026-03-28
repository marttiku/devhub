import React from 'react';
import type { Container } from '../types';

const healthIcon: Record<string, string> = {
  healthy: '✓', unhealthy: '✗', starting: '…', none: '·',
};

export function ContainerRow({ containers }: { containers: Container[] }) {
  if (containers.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 py-2 border-t border-gray-700 text-xs text-gray-400">
      {containers.map(c => (
        <span key={c.containerName} className="flex items-center gap-1">
          <span className={c.health === 'healthy' ? 'text-green-400' : c.health === 'unhealthy' ? 'text-red-400' : 'text-gray-500'}>
            {healthIcon[c.health]}
          </span>
          {c.containerName}
          {c.ports[0] && <span className="text-gray-600">:{c.ports[0].hostPort}</span>}
        </span>
      ))}
    </div>
  );
}
