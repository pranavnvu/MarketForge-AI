// ============================================
// DevForge AI — Agents Page
// ============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import { AGENT_CONFIG } from '@/lib/constants';
import { useProjects } from '@/hooks/use-projects';
import { getProjectAgentStatuses } from '@/lib/agent-lifecycle';
import type { AgentType } from '@/types';

type AgentStatus = 'running' | 'idle' | 'completed';

interface AgentProjectDetail {
  status: AgentStatus;
  tasks: number;
  runningProjects: { name: string; message: string }[];
  completedProjects: { name: string }[];
  waitingProjects: { name: string; message: string }[];
}

function useAgentStatuses() {
  const { data: dbProjects = [] } = useProjects();

  const deletedIds = (() => {
    try {
      const saved = localStorage.getItem('devforge_deleted_project_ids');
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  })();

  const activeProjects = dbProjects.filter((p) => !deletedIds.includes(p.id));
  const hasProjects = activeProjects.length > 0;

  const statuses: Record<string, AgentProjectDetail> = {};
  const allAgentKeys = Object.keys(AGENT_CONFIG) as AgentType[];

  for (const key of allAgentKeys) {
    if (!hasProjects) {
      statuses[key] = {
        status: 'idle',
        tasks: 0,
        runningProjects: [],
        completedProjects: [],
        waitingProjects: [],
      };
      continue;
    }

    const running: { name: string; message: string }[] = [];
    const completed: { name: string }[] = [];
    const waiting: { name: string; message: string }[] = [];

    for (const proj of activeProjects) {
      const agentMap = getProjectAgentStatuses(proj);
      const agentInfo = agentMap[key];
      if (!agentInfo) continue;

      if (agentInfo.status === 'running') {
        running.push({ name: proj.name, message: agentInfo.message });
      } else if (agentInfo.status === 'completed') {
        completed.push({ name: proj.name });
      } else if (agentInfo.status === 'waiting') {
        waiting.push({ name: proj.name, message: agentInfo.message });
      }
    }

    let overallStatus: AgentStatus = 'idle';
    if (running.length > 0) {
      overallStatus = 'running';
    } else if (completed.length > 0) {
      overallStatus = 'completed';
    } else {
      overallStatus = 'idle';
    }

    statuses[key] = {
      status: overallStatus,
      tasks: running.length + completed.length,
      runningProjects: running,
      completedProjects: completed,
      waitingProjects: waiting,
    };
  }

  return { statuses, totalProjects: activeProjects.length };
}

const statusStyles: Record<AgentStatus, { dot: string; label: string; textColor: string }> = {
  running: { dot: 'bg-emerald-500 animate-pulse', label: 'Running', textColor: 'text-emerald-500' },
  idle: { dot: 'bg-slate-500', label: 'Idle', textColor: 'text-slate-400' },
  completed: { dot: 'bg-blue-500', label: 'Completed', textColor: 'text-blue-400' },
};

export default function Agents() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<AgentStatus | 'all'>('all');
  const { statuses, totalProjects } = useAgentStatuses();

  const allAgents = (Object.entries(AGENT_CONFIG) as [AgentType, typeof AGENT_CONFIG[AgentType]][]).map(
    ([key, agent]) => ({
      key,
      ...agent,
      ...(statuses[key] || {
        status: 'idle' as AgentStatus,
        tasks: 0,
        runningProjects: [],
        completedProjects: [],
        waitingProjects: [],
      }),
    })
  );

  const filteredAgents = allAgents.filter((agent) => {
    const matchesSearch =
      !search.trim() ||
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.description.toLowerCase().includes(search.toLowerCase()) ||
      agent.key.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filterStatus === 'all' || agent.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const runningCount = allAgents.filter((a) => a.status === 'running').length;
  const idleCount = allAgents.filter((a) => a.status === 'idle').length;
  const completedCount = allAgents.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Agents</h1>
        <p className="text-sm text-muted-foreground">
          Your autonomous AI engineering team — 10 specialized agents
          {totalProjects > 0
            ? ` working across ${totalProjects} active project${totalProjects > 1 ? 's' : ''}.`
            : ' ready to build.'}
        </p>
      </div>

      {/* Stats Summary */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Running', count: runningCount, color: 'text-emerald-500', dot: 'bg-emerald-500', filterVal: 'running' as AgentStatus },
          { label: 'Idle', count: idleCount, color: 'text-slate-400', dot: 'bg-slate-500', filterVal: 'idle' as AgentStatus },
          { label: 'Completed', count: completedCount, color: 'text-blue-400', dot: 'bg-blue-500', filterVal: 'completed' as AgentStatus },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setFilterStatus(filterStatus === stat.filterVal ? 'all' : stat.filterVal)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
              filterStatus === stat.filterVal
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/50 bg-card/50 text-muted-foreground hover:bg-accent'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${stat.dot}`} />
            {stat.count} {stat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search agents by name or role..."
          className="w-full rounded-xl border border-border/50 bg-background py-2.5 pl-10 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Agent Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent, index) => {
          const style = statusStyles[agent.status];
          return (
            <motion.div
              key={agent.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${agent.color}15` }}
                >
                  {agent.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {agent.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              </div>

              {/* Status & Project Assignment */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.textColor}`}>
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    {style.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {agent.tasks} task{agent.tasks !== 1 ? 's' : ''} {agent.status === 'completed' ? 'done' : 'active'}
                  </span>
                </div>

                {/* Active Running Projects */}
                {agent.runningProjects.length > 0 && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-400 space-y-1">
                    {agent.runningProjects.map((p) => (
                      <div key={p.name} className="truncate">
                        ⚡ Working on: <span className="font-semibold text-foreground">{p.name}</span>
                        <div className="text-[11px] text-muted-foreground truncate">{p.message}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Completed Projects */}
                {agent.completedProjects.length > 0 && (
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-400 space-y-1">
                    {agent.completedProjects.map((p) => (
                      <div key={p.name} className="truncate">
                        ✅ Completed on: <span className="font-semibold text-foreground">{p.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Waiting Projects */}
                {agent.runningProjects.length === 0 && agent.completedProjects.length === 0 && agent.waitingProjects.length > 0 && (
                  <div className="rounded-lg bg-accent/40 px-3 py-1.5 text-xs text-muted-foreground truncate">
                    ⏳ Waiting on: <span className="font-medium text-foreground">{agent.waitingProjects[0].name}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredAgents.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/40 p-12 text-center backdrop-blur-sm">
          <Filter className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium">No agents match your filter</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different search term or status filter.</p>
          <button
            onClick={() => { setSearch(''); setFilterStatus('all'); }}
            className="mt-4 rounded-xl border border-border/50 bg-accent/50 px-4 py-2 text-xs font-semibold hover:bg-accent transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
