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
import { Link } from 'react-router-dom';
import { ROUTES, AGENT_CONFIG } from '@/lib/constants';

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
          value={3}
          icon={FolderKanban}
          trend="+2 this week"
          color="#8B5CF6"
        />
        <StatCard
          label="Running Agents"
          value={7}
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
            {[
              {
                name: 'Expense Tracker App',
                status: 'In Progress',
                statusColor: '#3B82F6',
                agents: 4,
                progress: 65,
              },
              {
                name: 'E-Commerce Platform',
                status: 'Planning',
                statusColor: '#8B5CF6',
                agents: 2,
                progress: 25,
              },
              {
                name: 'Task Management Tool',
                status: 'Completed',
                statusColor: '#10B981',
                agents: 10,
                progress: 100,
              },
            ].map((project) => (
              <div
                key={project.name}
                className="flex items-center gap-4 rounded-xl border border-border/30 p-4 hover:bg-accent/30 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{project.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        color: project.statusColor,
                        backgroundColor: `${project.statusColor}15`,
                      }}
                    >
                      {project.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {project.agents} agents active
                    </span>
                  </div>
                </div>
                <div className="w-24">
                  <div className="flex items-center justify-between text-xs mb-1">
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
              </div>
            ))}
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
