import React from 'react';

export type Filter = 'all' | 'running' | 'stopped' | 'node' | 'python' | 'has-docker';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'running', label: 'Running' },
  { id: 'stopped', label: 'Stopped' },
  { id: 'node', label: 'Node' },
  { id: 'python', label: 'Python' },
  { id: 'has-docker', label: 'Has Docker' },
];

interface Props {
  search: string;
  onSearch: (v: string) => void;
  filter: Filter;
  onFilter: (f: Filter) => void;
  connected: boolean;
  total: number;
  running: number;
}

export function TopBar({ search, onSearch, filter, onFilter, connected, total, running }: Props) {
  return (
    <header className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-6 py-3 flex flex-wrap gap-3 items-center">
      <h1 className="text-xl font-bold text-white mr-4">DevHub</h1>
      <input
        type="search"
        placeholder="Search projects…"
        value={search}
        onChange={e => onSearch(e.target.value)}
        className="bg-gray-800 text-gray-100 placeholder-gray-500 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="flex gap-1 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => onFilter(f.id)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === f.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
        <span>{running} running / {total} total</span>
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} title={connected ? 'Live' : 'Reconnecting…'} />
      </div>
    </header>
  );
}
