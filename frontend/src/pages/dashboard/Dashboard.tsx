// ============================================
// DevForge AI — Dashboard Home Page
// ============================================

import { motion } from 'framer-motion';
import {
  FolderKanban,
  Bot,
  Zap,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES, AGENT_CONFIG, PROJECT_STATUS_CONFIG } from '@/lib/constants';
import { useProjects } from '@/hooks/use-projects';

// ---- Stat Card ----
function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-shadow hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-500">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

// ---- Activity Item ----
function ActivityItem({
  title,
  description,
  time,
  icon,
}: {
  title: string;
  description: string;
  time: string;
  icon: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-3 hover:bg-accent/50 transition-colors">
      <span className="mt-0.5 text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  );
}

export default function Dashboard() {
  const { data: dbProjects = [] } = useProjects();
  const navigate = useNavigate();

  // Read deleted project IDs from localStorage to stay synced with Projects page
  const deletedIds = (() => {
    try {
      const saved = localStorage.getItem('devforge_deleted_project_ids');
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  })();

  const demoProjects = [
    {
      id: 'demo-1',
      name: 'Expense Tracker App',
      status: 'in_progress',
      progress: 65,
    },
    {
      id: 'demo-2',
      name: 'E-Commerce Platform',
      status: 'planning',
      progress: 25,
    },
    {
      id: 'demo-3',
      name: 'Task Management Tool',
      status: 'completed',
      progress: 100,
    },
  ];

  const allProjects = [...dbProjects, ...demoProjects].filter(
    (p) => !deletedIds.includes(p.id)
  );

  const activeCount = allProjects.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here's an overview of your AI development projects.
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

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Projects"
          value={activeCount}
          icon={FolderKanban}
          trend={activeCount > 0 ? "+2 this week" : undefined}
          color="#8B5CF6"
        />
        <StatCard
          label="Running Agents"
          value={activeCount > 0 ? 7 : 0}
          icon={Bot}
          color="#06B6D4"
        />
        <StatCard
          label="Tokens Used"
          value="24.5k"
          icon={Zap}
          trend="+12% vs last week"
          color="#F59E0B"
        />
        <StatCard
          label="Success Rate"
          value="94%"
          icon={TrendingUp}
          trend="+3% improvement"
          color="#10B981"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects */}
        <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Projects</h2>
            <Link
              to={ROUTES.PROJECTS}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View All
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {allProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FolderKanban className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium">No active projects</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Create your first AI multi-agent project to get started.</p>
                <Link
                  to={ROUTES.NEW_PROJECT}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Project
                </Link>
              </div>
            ) : (
              allProjects.slice(0, 5).map((project) => {
                const statusKey = (project.status || 'planning') as keyof typeof PROJECT_STATUS_CONFIG;
                const statusConfig = PROJECT_STATUS_CONFIG[statusKey] || PROJECT_STATUS_CONFIG.planning;

                return (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/dashboard/projects/${project.id}/workspace`)}
                    className="flex items-center gap-4 rounded-xl border border-border/30 p-4 hover:bg-accent/30 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{project.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            color: statusConfig.color,
                            backgroundColor: `${statusConfig.color}15`,
                          }}
                        >
                          {statusConfig.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          10 agents active
                        </span>
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="flex items-center justify-between text-xs mb-1">
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
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-1">
            <ActivityItem
              title="Backend API Complete"
              description="Expense Tracker — 12 endpoints generated"
              time="2m ago"
              icon="⚙️"
            />
            <ActivityItem
              title="Architecture Designed"
              description="E-Commerce Platform — System diagram ready"
              time="15m ago"
              icon="🏗️"
            />
            <ActivityItem
              title="Tests Passed"
              description="Task Management — 48/48 tests passing"
              time="1h ago"
              icon="🧪"
            />
            <ActivityItem
              title="Code Review Complete"
              description="Expense Tracker — 3 suggestions applied"
              time="2h ago"
              icon="👁️"
            />
            <ActivityItem
              title="Deployed to Production"
              description="Task Management — Live on Railway"
              time="5h ago"
              icon="🚀"
            />
          </div>
        </div>
      </div>

      {/* Agent Overview */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold">AI Agent Team</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(AGENT_CONFIG).map(([key, agent]) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-xl border border-border/30 p-3 hover:bg-accent/30 transition-colors"
            >
              <span className="text-xl">{agent.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{agent.name}</p>
                <p className="text-xs text-muted-foreground">Ready</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
