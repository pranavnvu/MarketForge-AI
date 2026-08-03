// ============================================
// DevForge AI — Project Detail Page
// ============================================

import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Download, GitBranch } from 'lucide-react';
import { ROUTES, AGENT_CONFIG } from '@/lib/constants';
import { useProject } from '@/hooks/use-projects';
import { getProjectAgentStatuses } from '@/lib/agent-lifecycle';
import type { AgentType } from '@/types';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id || '');

  const projectName = project?.name || 'Project Overview';
  const projectTech = project?.config?.techStack || 'fullstack';
  const projectLang = project?.config?.language || 'typescript';
  const overallProgress = project?.progress ?? 5;

  const agentStatuses = project
    ? getProjectAgentStatuses(project)
    : ({} as ReturnType<typeof getProjectAgentStatuses>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Link
          to={ROUTES.PROJECTS}
          className="rounded-lg p-2 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{projectName}</h1>
          <p className="text-sm text-muted-foreground">
            Project ID: {id} · {projectTech} ({projectLang})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`${ROUTES.PROJECTS}/${id}/workspace`}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/30 px-3.5 py-2 text-sm font-semibold text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            Open Workspace
          </Link>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border/50 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <GitBranch className="h-4 w-4" />
            GitHub
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border/50 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-border/50 bg-card/40 p-12 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Progress Overview */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold">Overall Build Progress</h2>
                <p className="text-xs text-muted-foreground">
                  Status: <span className="font-semibold text-foreground capitalize">{project?.status || 'Planning'}</span>
                </p>
              </div>
              <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
            </div>
            <div className="h-3 rounded-full bg-accent overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
              />
            </div>
          </div>

          {/* Agent Execution Pipeline */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-1">AI Agent Pipeline</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Real-time execution status of your 10 specialized AI engineering agents on this project.
            </p>

            <div className="space-y-3">
              {(Object.entries(AGENT_CONFIG) as [AgentType, typeof AGENT_CONFIG[AgentType]][]).map(
                ([key, agent], index) => {
                  const agentStatus = agentStatuses[key] || { status: 'waiting', progress: 0, message: 'Waiting' };
                  const isCompleted = agentStatus.status === 'completed';
                  const isRunning = agentStatus.status === 'running';

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                        isRunning
                          ? 'border-primary/40 bg-primary/5'
                          : isCompleted
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-border/30 opacity-70'
                      }`}
                    >
                      <span className="text-2xl">{agent.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{agent.name}</p>
                          {isCompleted && (
                            <span className="text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              ✓ Completed
                            </span>
                          )}
                          {isRunning && (
                            <span className="flex items-center gap-1 text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Running
                            </span>
                          )}
                          {agentStatus.status === 'waiting' && (
                            <span className="text-xs text-muted-foreground bg-accent/60 px-2 py-0.5 rounded-full">
                              Waiting
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {agentStatus.message}
                        </p>
                        {agentStatus.progress > 0 && (
                          <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-accent overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted
                                  ? 'bg-emerald-500'
                                  : 'bg-gradient-to-r from-purple-500 to-cyan-500'
                              }`}
                              style={{ width: `${agentStatus.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold" style={{ color: agent.color }}>
                        {agentStatus.progress}%
                      </span>
                    </motion.div>
                  );
                }
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
