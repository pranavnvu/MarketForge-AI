// ============================================
// DevForge AI — Projects Page
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Loader2, X, FolderKanban } from 'lucide-react';
import { ROUTES, PROJECT_STATUS_CONFIG } from '@/lib/constants';
import { useProjects, useDeleteProject } from '@/hooks/use-projects';
import type { ProjectStatus } from '@/types';

const defaultDemoProjects = [
  {
    id: 'demo-1',
    name: 'Expense Tracker App',
    description: 'A full-stack expense tracking application with budget management and analytics.',
    status: 'in_progress' as ProjectStatus,
    progress: 65,
    createdAt: '2026-08-01T12:00:00Z',
    config: {
      techStack: 'Fullstack',
      language: 'TypeScript',
      deployTarget: 'Docker',
    },
  },
  {
    id: 'demo-2',
    name: 'E-Commerce Platform',
    description: 'Modern e-commerce platform with payment processing and inventory management.',
    status: 'planning' as ProjectStatus,
    progress: 25,
    createdAt: '2026-08-01T10:00:00Z',
    config: {
      techStack: 'Fullstack',
      language: 'Python',
      deployTarget: 'AWS',
    },
  },
  {
    id: 'demo-3',
    name: 'Task Management Tool',
    description: 'Collaborative task management with Kanban boards and team features.',
    status: 'completed' as ProjectStatus,
    progress: 100,
    createdAt: '2026-07-28T09:00:00Z',
    config: {
      techStack: 'Frontend',
      language: 'React',
      deployTarget: 'Vercel',
    },
  },
];

function matchesSearchQuery(project: any, searchInput: string): boolean {
  if (!searchInput.trim()) return true;

  const rawQuery = searchInput.trim().toLowerCase();
  const normalizedQuery = rawQuery.replace(/[\s_]+/g, ' ');

  const rawName = (project.name || '').toLowerCase();
  const normalizedName = rawName.replace(/[\s_]+/g, ' ');

  const rawDesc = (project.description || '').toLowerCase();
  const normalizedDesc = rawDesc.replace(/[\s_]+/g, ' ');

  const statusLabel = (project.status || '').toLowerCase();
  const techStack = (project.config?.techStack || '').toLowerCase();
  const language = (project.config?.language || '').toLowerCase();
  const deployTarget = (project.config?.deployTarget || '').toLowerCase();

  const queryTokens = normalizedQuery.split(' ').filter(Boolean);

  return queryTokens.every((token) => {
    return (
      rawName.includes(token) ||
      normalizedName.includes(token) ||
      rawDesc.includes(token) ||
      normalizedDesc.includes(token) ||
      statusLabel.includes(token) ||
      techStack.includes(token) ||
      language.includes(token) ||
      deployTarget.includes(token)
    );
  });
}

export default function Projects() {
  const { data: dbProjects = [], isLoading } = useProjects();
  const deleteMutation = useDeleteProject();
  const [search, setSearch] = useState('');

  // Persist deleted project IDs in localStorage so deletion persists across browser refreshes
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('devforge_deleted_project_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    const newDeleted = [...deletedIds, id];
    setDeletedIds(newDeleted);
    try {
      localStorage.setItem('devforge_deleted_project_ids', JSON.stringify(newDeleted));
    } catch {
      // Ignore localStorage write errors
    }

    if (!id.startsWith('demo-')) {
      deleteMutation.mutate(id);
    }
  };

  // Combine real database projects with initial default projects and filter out deleted IDs & apply search query
  const availableProjects = [...dbProjects, ...defaultDemoProjects].filter(
    (p) => !deletedIds.includes(p.id)
  );

  const filteredProjects = availableProjects.filter((p) =>
    matchesSearchQuery(p, search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your AI-generated software projects.
          </p>
        </div>
        <Link
          to={ROUTES.NEW_PROJECT}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, description, stack, or language..."
            className="w-full rounded-xl border border-border/50 bg-background py-2.5 pl-10 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/40 p-12 text-center backdrop-blur-sm">
          <FolderKanban className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-semibold">No projects found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {search
              ? `No projects matching "${search}". Try searching with different keywords.`
              : 'You have no active projects. Create your first project to get started.'}
          </p>
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="mt-4 rounded-xl border border-border/50 bg-accent/50 px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Clear Search
            </button>
          ) : (
            <Link
              to={ROUTES.NEW_PROJECT}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow"
            >
              <Plus className="h-3.5 w-3.5" />
              New Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => {
            const statusKey = (project.status || 'planning') as keyof typeof PROJECT_STATUS_CONFIG;
            const statusConfig = PROJECT_STATUS_CONFIG[statusKey] || PROJECT_STATUS_CONFIG.planning;
            const createdDate = project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Just now';

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={`/dashboard/projects/${project.id}/workspace`}
                  className="block rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-shadow hover:shadow-lg group relative"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        color: statusConfig.color,
                        backgroundColor: `${statusConfig.color}15`,
                      }}
                    >
                      {statusConfig.label}
                    </span>

                    <button
                      onClick={(e) => handleDelete(e, project.id)}
                      title="Delete Project"
                      className="rounded-lg p-1.5 opacity-80 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {project.description || 'AI Multi-Agent project workspace'}
                  </p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress ?? 10}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-accent">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                        style={{ width: `${project.progress ?? 10}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>10 agents active</span>
                    <span>{createdDate}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
