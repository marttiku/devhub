import React from 'react';
import type { ProjectStatus } from '../types';

const colors: Record<ProjectStatus, string> = {
  running: 'bg-green-500',
  stopped: 'bg-red-500',
  'no-docker': 'bg-gray-500',
  unknown: 'bg-yellow-500',
};

export function StatusDot({ status }: { status: ProjectStatus }) {
  const pulse = status === 'running' ? 'animate-pulse' : '';
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]} ${pulse}`} />
  );
}
