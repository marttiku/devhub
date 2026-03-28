import React, { useState, useMemo } from 'react';
import { useProjects } from './hooks/useProjects';
import { TopBar, Filter } from './components/TopBar';
import { ProjectGrid } from './components/ProjectGrid';
import type { Project } from './types';

function applyFilter(projects: Project[], filter: Filter, search: string): Project[] {
  return projects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'running') return p.status === 'running';
    if (filter === 'stopped') return p.status === 'stopped';
    if (filter === 'node') return p.type === 'node';
    if (filter === 'python') return p.type === 'python';
    if (filter === 'has-docker') return p.hasDocker;
    return true;
  });
}

export default function App() {
  const { projects, connected } = useProjects();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => applyFilter(projects, filter, search), [projects, filter, search]);
  const running = projects.filter(p => p.status === 'running').length;

  return (
    <div className="min-h-screen bg-gray-950">
      <TopBar
        search={search} onSearch={setSearch}
        filter={filter} onFilter={setFilter}
        connected={connected} total={projects.length} running={running}
      />
      {!connected && (
        <div className="text-center text-yellow-500 text-sm py-2 bg-yellow-950">
          Reconnecting to DevHub server…
        </div>
      )}
      <ProjectGrid projects={filtered} />
    </div>
  );
}
