import React, { useState } from 'react';
import type { Project } from '../types';
import { StatusDot } from './StatusDot';
import { ContainerRow } from './ContainerRow';

const typeColors: Record<string, string> = {
  node: 'bg-green-900 text-green-300',
  python: 'bg-blue-900 text-blue-300',
  go: 'bg-cyan-900 text-cyan-300',
  other: 'bg-gray-800 text-gray-400',
};

function GitIcon({ provider }: { provider: string }) {
  if (provider === 'github') return <span title="GitHub">GH</span>;
  if (provider === 'gitlab') return <span title="GitLab">GL</span>;
  return <span title="Git">⎘</span>;
}

async function callAction(projectId: string, action: string, body?: object) {
  const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json() as Promise<{ ok: boolean; url?: string; error?: string; healthy?: boolean }>;
}

export function ProjectCard({ project }: { project: Project }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpen = async () => {
    setLoading('open');
    try {
      if (project.status === 'stopped' || project.status === 'no-docker') {
        if (project.hasDocker) {
          const startRes = await callAction(project.id, 'start');
          if (!startRes.ok) { showToast(startRes.error || 'Failed to start'); return; }
          if (!startRes.healthy) showToast('Started but not fully healthy — opening anyway');
          await callAction(project.id, 'open-browser', { url: startRes.url });
        }
      } else {
        await callAction(project.id, 'open-browser');
      }
    } finally { setLoading(null); }
  };

  const handleStop = async () => {
    setLoading('stop');
    const res = await callAction(project.id, 'stop');
    if (!res.ok) showToast(res.error || 'Failed to stop');
    setLoading(null);
  };

  const handleCursor = async () => {
    setLoading('cursor');
    const res = await callAction(project.id, 'open-cursor');
    if (!res.ok) showToast(res.error || 'Failed to open Cursor');
    setLoading(null);
  };

  const canOpen = project.hasDocker || project.primaryPort != null;
  const canStop = project.status === 'running' && project.hasDocker;
  const canCursor = project.hostPath != null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3 hover:border-gray-600 transition-colors relative">
      {toast && (
        <div className="absolute top-2 left-2 right-2 bg-red-900 text-red-200 text-xs rounded px-3 py-1.5 z-10">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2">
        <StatusDot status={project.status} />
        <span className="font-semibold text-white truncate flex-1">{project.name}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${typeColors[project.type] || typeColors.other}`}>
          {project.type}
        </span>
        {project.gitRemote && (
          <a href={project.gitRemote.url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-300 font-mono">
            <GitIcon provider={project.gitRemote.provider} />
          </a>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
      )}

      {/* Git info */}
      {(project.branch || project.lastCommit) && (
        <p className="text-xs text-gray-600">
          {project.branch && <span className="text-gray-500">{project.branch}</span>}
          {project.lastCommit && (
            <span> · {project.lastCommit.relative} · <span className="italic">{project.lastCommit.message}</span></span>
          )}
        </p>
      )}

      {/* Containers */}
      <ContainerRow containers={project.containers} />

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {canOpen && (
          <button
            onClick={handleOpen}
            disabled={loading === 'open'}
            className="flex-1 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
          >
            {loading === 'open' ? 'Opening…' : project.status === 'stopped' ? '▶ Start & Open' : '▶ Open'}
          </button>
        )}
        {canStop && (
          <button
            onClick={handleStop}
            disabled={loading === 'stop'}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
          >
            {loading === 'stop' ? '…' : '⏹'}
          </button>
        )}
        {canCursor && (
          <button
            onClick={handleCursor}
            disabled={loading === 'cursor'}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-xs font-medium px-3 py-1.5 rounded transition-colors"
          >
            {loading === 'cursor' ? '…' : '◇ Cursor'}
          </button>
        )}
        {project.gitRemote && (
          <a href={project.gitRemote.url} target="_blank" rel="noopener noreferrer"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1.5 rounded transition-colors">
            ⎘
          </a>
        )}
      </div>
    </div>
  );
}
