import React from 'react';
import type { Project } from '../types';
import { ProjectCard } from './ProjectCard';

export function ProjectGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return <p className="text-gray-500 text-center mt-16">No projects match your filters.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
      {projects.map(p => <ProjectCard key={p.id} project={p} />)}
    </div>
  );
}
