// ============================================
// DevForge AI — Project Detail Page
// ============================================

import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, RefreshCw, Download, GitBranch } from 'lucide-react';
import { ROUTES, AGENT_CONFIG } from '@/lib/constants';
import type { AgentType } from '@/types';

const agentStatuses: Record<string, { status: string; progress: number }> = {
  product_manager: { status: 'completed', progress: 100 },
  architect: { status: 'completed', progress: 100 },
  planner: { status: 'completed', progress: 100 },
  backend_dev: { status: 'running', progress: 72 },
  frontend_dev: { status: 'running', progress: 45 },
  qa_engineer: { status: 'waiting', progress: 0 },
  security_analyst: { status: 'waiting', progress: 0 },
  code_reviewer: { status: 'waiting', progress: 0 },
  documentation: { status: 'waiting', progress: 0 },
  devops: { status: 'waiting', progress: 0 },
};

export default function ProjectDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={ROUTES.PROJECTS}
          className="rounded-lg p-2 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Expense Tracker App</h1>
          <p className="text-sm text-muted-foreground">Project ID: {id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`${ROUTES.PROJECTS}/${id}/workspace`}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/30 px-3 py-2 text-sm font-semibold text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            Open Workspace
          </Link>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border/50 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <GitBranch className="h-4 w-4" />
            Push to GitHub
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border/50 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <Download className="h-4 w-4" />
            Download
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/25">
            <Play className="h-4 w-4" />
            Resume
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Overall Progress</h2>
          <span className="text-2xl font-bold text-primary">45%</span>
        </div>
        <div className="h-3 rounded-full bg-accent">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '45%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
          />
        </div>
      </div>

      {/* Agent Execution Pipeline */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-4">Agent Pipeline</h2>
        <div className="space-y-3">
          {(Object.entries(AGENT_CONFIG) as [AgentType, typeof AGENT_CONFIG[AgentType]][]).map(
            ([key, agent], index) => {
              const agentStatus = agentStatuses[key];
              const isCompleted = agentStatus.status === 'completed';
              const isRunning = agentStatus.status === 'running';

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                    isRunning
                      ? 'border-primary/30 bg-primary/5'
                      : isCompleted
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-border/30'
                  }`}
                >
                  <span className="text-xl">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{agent.name}</p>
                      {isCompleted && (
                        <span className="text-xs text-emerald-500 font-medium">✓ Complete</span>
                      )}
                      {isRunning && (
                        <span className="flex items-center gap-1 text-xs text-primary font-medium">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Running...
                        </span>
                      )}
                      {agentStatus.status === 'waiting' && (
                        <span className="text-xs text-muted-foreground">Waiting</span>
                      )}
                    </div>
                    {agentStatus.progress > 0 && (
                      <div className="mt-1.5 h-1.5 w-full max-w-xs rounded-full bg-accent">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCompleted
                              ? 'bg-emerald-500'
                              : 'bg-gradient-to-r from-purple-500 to-cyan-500'
                          }`}
                          style={{ width: `${agentStatus.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium" style={{ color: agent.color }}>
                    {agentStatus.progress}%
                  </span>
                </motion.div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
