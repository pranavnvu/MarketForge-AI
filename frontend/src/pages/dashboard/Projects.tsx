// ============================================
// DevForge AI — Projects Page
// ============================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';
import { ROUTES, PROJECT_STATUS_CONFIG } from '@/lib/constants';
import type { ProjectStatus } from '@/types';

const mockProjects = [
  {
    id: '1',
    name: 'Expense Tracker App',
    description: 'A full-stack expense tracking application with budget management and analytics.',
    status: 'in_progress' as ProjectStatus,
    progress: 65,
    agents: 4,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'E-Commerce Platform',
    description: 'Modern e-commerce platform with payment processing and inventory management.',
    status: 'planning' as ProjectStatus,
    progress: 25,
    agents: 2,
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    name: 'Task Management Tool',
    description: 'Collaborative task management with Kanban boards and team features.',
    status: 'completed' as ProjectStatus,
    progress: 100,
    agents: 10,
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    name: 'Social Media Dashboard',
    description: 'Analytics dashboard for social media accounts with scheduling features.',
    status: 'draft' as ProjectStatus,
    progress: 0,
    agents: 0,
    createdAt: '2024-01-16',
  },
];

export default function Projects() {
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

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full rounded-xl border border-border/50 bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-border/50 px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project, index) => {
          const statusConfig = PROJECT_STATUS_CONFIG[project.status];

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={`${ROUTES.PROJECTS}/${project.id}`}
                className="block rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-shadow hover:shadow-lg group"
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
                  <button className="rounded-lg p-1 opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <h3 className="mt-3 text-lg font-semibold group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-accent">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.agents} agents</span>
                  <span>{project.createdAt}</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
