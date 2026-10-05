// ============================================
// DevForge AI — Project Detail Page
// ============================================

import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Download, GitBranch, Power, PowerOff, Play, CheckCircle2, Loader2 } from 'lucide-react';
import { ROUTES, AGENT_CONFIG } from '@/lib/constants';
import { useProject, useUpdateProject, useRunOrchestration } from '@/hooks/use-projects';
import {
  getProjectAgentStatuses,
  getDisabledAgentsForProject,
  toggleAgentForProject,
} from '@/lib/agent-lifecycle';
import type { AgentType } from '@/types';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, refetch } = useProject(id || '');
  const updateProject = useUpdateProject();
  const runOrchestration = useRunOrchestration();

  const [disabledAgents, setDisabledAgents] = useState<AgentType[]>([]);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (project) {
      setDisabledAgents(getDisabledAgentsForProject(project));
    }
  }, [project]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const projectName = project?.name || 'Project Overview';
  const projectTech = project?.config?.techStack || 'fullstack';
  const projectLang = project?.config?.language || 'typescript';
  const overallProgress = project?.progress ?? 5;

  const agentStatuses = project
    ? getProjectAgentStatuses(project)
    : ({} as ReturnType<typeof getProjectAgentStatuses>);

  const handleToggleAgent = (key: AgentType) => {
    if (!project) return;
    const isDisabled = disabledAgents.includes(key);
    const newDisabled = toggleAgentForProject(project, key, isDisabled);
    setDisabledAgents(newDisabled);

    updateProject.mutate({
      id: project.id,
      data: {
        config: {
          ...(project.config || {}),
          disabledAgents: newDisabled,
        },
      },
    });
  };

  const handleRunPipeline = async () => {
    if (!project || isPipelineRunning) return;

    setIsPipelineRunning(true);
    showToast('🚀 Starting 10-agent pipeline...');

    // Start polling for progress updates every 2 seconds
    pollingRef.current = setInterval(() => {
      refetch();
    }, 2000);

    try {
      await runOrchestration.mutateAsync(project.id);

      // Pipeline complete
      if (pollingRef.current) clearInterval(pollingRef.current);
      await refetch();
      setIsPipelineRunning(false);
      showToast('🎉 All 10 agents completed! Project build finished successfully.');
    } catch (err: any) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setIsPipelineRunning(false);
      const errorMsg = err?.response?.data?.detail || 'Pipeline execution failed';
      showToast(`❌ Error: ${errorMsg}`);
    }
  };

  const isCompleted = project?.status === 'completed' || overallProgress >= 100;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-500 border border-emerald-400 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

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
          {/* Run Pipeline Button */}
          {!isCompleted && (
            <button
              onClick={handleRunPipeline}
              disabled={isPipelineRunning}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                isPipelineRunning
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400 cursor-wait'
                  : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
              }`}
            >
              {isPipelineRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Running Pipeline...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Run Agent Pipeline
                </>
              )}
            </button>
          )}

          {isCompleted && (
            <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Build Complete
            </span>
          )}

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
                  Status: <span className={`font-semibold capitalize ${isCompleted ? 'text-emerald-400' : 'text-foreground'}`}>{project?.status || 'Planning'}</span>
                  {isPipelineRunning && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                      <Loader2 className="h-3 w-3 animate-spin" /> Pipeline Running
                    </span>
                  )}
                  {disabledAgents.length > 0 && (
                    <span className="ml-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                      {disabledAgents.length} Agent{disabledAgents.length > 1 ? 's' : ''} Disabled
                    </span>
                  )}
                </p>
              </div>
              <span className={`text-2xl font-bold ${isCompleted ? 'text-emerald-400' : 'text-primary'}`}>{overallProgress}%</span>
            </div>
            <div className="h-3 rounded-full bg-accent overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-500 to-cyan-500'}`}
              />
            </div>
          </div>

          {/* Agent Execution Pipeline */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold">AI Agent Team & Enable/Disable Options</h2>
                <p className="text-xs text-muted-foreground">
                  Toggle individual AI agents on or off specifically for this project anytime.
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {(Object.entries(AGENT_CONFIG) as [AgentType, typeof AGENT_CONFIG[AgentType]][]).map(
                ([key, agent], index) => {
                  const agentStatus = agentStatuses[key] || { status: 'waiting', progress: 0, message: 'Waiting' };
                  const isDisabled = agentStatus.status === 'disabled';
                  const isAgentCompleted = agentStatus.status === 'completed';
                  const isRunning = agentStatus.status === 'running';

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                        isDisabled
                          ? 'border-border/30 bg-card/20 opacity-50'
                          : isRunning
                            ? 'border-primary/40 bg-primary/5'
                            : isAgentCompleted
                              ? 'border-emerald-500/30 bg-emerald-500/5'
                              : 'border-border/30'
                      }`}
                    >
                      <span className="text-2xl">{agent.icon}</span>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold ${isDisabled ? 'line-through text-muted-foreground' : ''}`}>
                            {agent.name}
                          </p>

                          {isDisabled && (
                            <span className="text-xs text-slate-400 font-medium bg-slate-500/10 px-2 py-0.5 rounded-full border border-slate-500/20">
                              🚫 Disabled for Project
                            </span>
                          )}
                          {isAgentCompleted && (
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

                        {!isDisabled && agentStatus.progress > 0 && (
                          <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-accent overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isAgentCompleted
                                  ? 'bg-emerald-500'
                                  : 'bg-gradient-to-r from-purple-500 to-cyan-500'
                              }`}
                              style={{ width: `${agentStatus.progress}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Agent Status Progress % */}
                      {!isDisabled && (
                        <span className="text-sm font-bold" style={{ color: agent.color }}>
                          {agentStatus.progress}%
                        </span>
                      )}

                      {/* Enable/Disable Toggle Button */}
                      <button
                        onClick={() => handleToggleAgent(key)}
                        disabled={isPipelineRunning}
                        title={isDisabled ? `Enable ${agent.name} for this project` : `Disable ${agent.name} for this project`}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDisabled
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        {isDisabled ? (
                          <>
                            <Power className="h-3.5 w-3.5" />
                            Enable Agent
                          </>
                        ) : (
                          <>
                            <PowerOff className="h-3.5 w-3.5" />
                            Disable Agent
                          </>
                        )}
                      </button>
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
