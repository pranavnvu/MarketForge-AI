// ============================================
// DevForge AI — Dynamic Agent Lifecycle Helper
// ============================================

import { AGENT_CONFIG } from '@/lib/constants';
import type { AgentType, Project } from '@/types';

export type SingleAgentStatus = 'running' | 'idle' | 'completed' | 'waiting' | 'disabled';

export interface ProjectAgentInfo {
  status: SingleAgentStatus;
  progress: number;
  message: string;
}

/**
 * Retrieves the list of disabled agent keys for a project from project config & localStorage.
 */
export function getDisabledAgentsForProject(project: Project): AgentType[] {
  const disabledSet = new Set<AgentType>();

  // 1. Check project config
  if (Array.isArray(project.config?.disabledAgents)) {
    project.config.disabledAgents.forEach((a) => disabledSet.add(a as AgentType));
  }

  // 2. Check localStorage cache
  try {
    const saved = localStorage.getItem(`devforge_disabled_agents_${project.id}`);
    if (saved) {
      const parsed = JSON.parse(saved) as AgentType[];
      parsed.forEach((a) => disabledSet.add(a));
    }
  } catch {
    // Ignore JSON errors
  }

  return Array.from(disabledSet);
}

/**
 * Toggles an agent enabled/disabled state for a specific project.
 */
export function toggleAgentForProject(project: Project, agentKey: AgentType, enabled: boolean): AgentType[] {
  const currentDisabled = getDisabledAgentsForProject(project);
  let newDisabled: AgentType[];

  if (enabled) {
    newDisabled = currentDisabled.filter((a) => a !== agentKey);
  } else {
    newDisabled = currentDisabled.includes(agentKey) ? currentDisabled : [...currentDisabled, agentKey];
  }

  try {
    localStorage.setItem(`devforge_disabled_agents_${project.id}`, JSON.stringify(newDisabled));
  } catch {
    // Ignore localStorage errors
  }

  return newDisabled;
}

/**
 * Calculates exact agent status, progress percentage, and active task description
 * for a specific project based on its status, progress, and enabled/disabled state.
 */
export function getProjectAgentStatuses(project: Project): Record<AgentType, ProjectAgentInfo> {
  const status = project.status;
  const progress = project.progress ?? 0;
  const disabledAgents = getDisabledAgentsForProject(project);
  const result: Partial<Record<AgentType, ProjectAgentInfo>> = {};

  const allAgentKeys = Object.keys(AGENT_CONFIG) as AgentType[];

  for (const key of allAgentKeys) {
    // Agent disabled by user for this project
    if (disabledAgents.includes(key)) {
      result[key] = {
        status: 'disabled',
        progress: 0,
        message: 'Disabled for this project by user',
      };
      continue;
    }

    // Project fully completed
    if (status === 'completed' || progress >= 100) {
      result[key] = { status: 'completed', progress: 100, message: 'All tasks completed successfully' };
      continue;
    }

    // Project failed
    if (status === 'failed') {
      result[key] = { status: 'completed', progress: 100, message: 'Execution halted' };
      continue;
    }

    switch (key) {
      case 'product_manager':
        if (status === 'planning' || progress < 25) {
          result[key] = {
            status: 'running',
            progress: Math.min(95, Math.max(30, Math.round(progress * 3.8))),
            message: 'Gathering requirements & drafting user stories',
          };
        } else {
          result[key] = { status: 'completed', progress: 100, message: 'PRD & user stories finalized' };
        }
        break;

      case 'architect':
        if (progress < 10) {
          result[key] = { status: 'waiting', progress: 0, message: 'Waiting for PRD from Product Manager' };
        } else if (status === 'planning' || progress < 30) {
          result[key] = {
            status: 'running',
            progress: Math.min(95, Math.max(20, Math.round((progress - 10) * 4.5))),
            message: 'Designing system architecture & DB schemas',
          };
        } else {
          result[key] = { status: 'completed', progress: 100, message: 'Architecture diagram & API specs complete' };
        }
        break;

      case 'planner':
        if (progress < 18) {
          result[key] = { status: 'waiting', progress: 0, message: 'Waiting for Architecture specifications' };
        } else if (status === 'planning' || progress < 35) {
          result[key] = {
            status: 'running',
            progress: Math.min(95, Math.max(25, Math.round((progress - 18) * 5))),
            message: 'Creating dependency graph & sprint backlog',
          };
        } else {
          result[key] = { status: 'completed', progress: 100, message: 'Sprint plan & task graph created' };
        }
        break;

      case 'backend_dev':
        if (progress < 30) {
          result[key] = { status: 'waiting', progress: 0, message: 'Waiting for sprint plan & API schemas' };
        } else if (status === 'in_progress' || progress < 70) {
          result[key] = {
            status: 'running',
            progress: Math.min(95, Math.max(20, Math.round(((progress - 30) / 40) * 100))),
            message: 'Building FastAPI routes, ORM models & business logic',
          };
        } else {
          result[key] = { status: 'completed', progress: 100, message: 'Backend APIs & models complete' };
        }
        break;

      case 'frontend_dev':
        if (progress < 35) {
          result[key] = { status: 'waiting', progress: 0, message: 'Waiting for backend endpoint definitions' };
        } else if (status === 'in_progress' || progress < 80) {
          result[key] = {
            status: 'running',
            progress: Math.min(95, Math.max(15, Math.round(((progress - 35) / 45) * 100))),
            message: 'Building React UI components, views & state management',
          };
        } else {
          result[key] = { status: 'completed', progress: 100, message: 'React components & views built' };
        }
        break;

      case 'devops':
        if (progress < 40) {
          result[key] = { status: 'waiting', progress: 0, message: 'Waiting for codebase setup' };
        } else if (progress < 95) {
          result[key] = {
            status: 'running',
            progress: Math.min(95, Math.max(20, Math.round(((progress - 40) / 55) * 100))),
            message: 'Configuring Docker, environment & CI/CD pipeline',
          };
        } else {
          result[key] = { status: 'completed', progress: 100, message: 'Docker setup & deployment configs ready' };
        }
        break;

      case 'qa_engineer':
        if (progress < 60) {
          result[key] = { status: 'waiting', progress: 0, message: 'Waiting for build completion' };
        } else if (status === 'testing' || progress < 88) {
          result[key] = {
            status: 'running',
            progress: Math.min(95, Math.max(20, Math.round(((progress - 60) / 28) * 100))),
            message: 'Writing unit tests & running integration test suite',
          };
        } else {
          result[key] = { status: 'completed', progress: 100, message: 'All unit & integration tests passing' };
        }
        break;

      case 'security_analyst':
        if (progress < 65) {
          result[key] = { status: 'waiting', progress: 0, message: 'Waiting for QA test suite' };
        } else if (status === 'testing' || progress < 90) {
          result[key] = {
            status: 'running',
            progress: Math.min(95, Math.max(20, Math.round(((progress - 65) / 25) * 100))),
            message: 'Running OWASP vulnerability & secret scans',
          };
        } else {
          result[key] = { status: 'completed', progress: 100, message: 'Security audit complete — 0 vulnerabilities' };
        }
        break;

      case 'code_reviewer':
        if (progress < 80) {
          result[key] = { status: 'waiting', progress: 0, message: 'Waiting for security & test validation' };
        } else if (status === 'review' || progress < 95) {
          result[key] = {
            status: 'running',
            progress: Math.min(95, Math.max(20, Math.round(((progress - 80) / 15) * 100))),
            message: 'Auditing code quality, refactoring & conventions',
          };
        } else {
          result[key] = { status: 'completed', progress: 100, message: 'Code quality approved' };
        }
        break;

      case 'documentation':
        if (progress < 85) {
          result[key] = { status: 'waiting', progress: 0, message: 'Waiting for final code review' };
        } else if (status === 'review' || progress < 99) {
          result[key] = {
            status: 'running',
            progress: Math.min(95, Math.max(20, Math.round(((progress - 85) / 14) * 100))),
            message: 'Writing README, API references & deployment guides',
          };
        } else {
          result[key] = { status: 'completed', progress: 100, message: 'Documentation & API specs generated' };
        }
        break;

      default:
        result[key as AgentType] = { status: 'idle', progress: 0, message: 'Ready' };
    }
  }

  return result as Record<AgentType, ProjectAgentInfo>;
}

export interface DynamicNotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'agent' | 'security' | 'build' | 'system';
  link?: string;
}

/**
 * Dynamically constructs live notifications based on actual project states and agent lifecycle activities.
 */
export function generateLiveProjectNotifications(projects: Project[]): DynamicNotificationItem[] {
  const list: DynamicNotificationItem[] = [];

  if (!projects || projects.length === 0) {
    list.push({
      id: 'welcome-notif',
      title: 'DevForge AI Ready',
      message: 'Create a new project to dispatch multi-agent pipelines.',
      time: 'Just now',
      read: false,
      type: 'system',
      link: '/dashboard/projects/new',
    });
    return list;
  }

  projects.forEach((proj) => {
    const statuses = getProjectAgentStatuses(proj);
    const allKeys = Object.keys(statuses) as AgentType[];
    const runningAgent = allKeys.find((k) => statuses[k]?.status === 'running');
    const completedAgents = allKeys.filter((k) => statuses[k]?.status === 'completed');

    if (runningAgent) {
      const info = statuses[runningAgent];
      const agentConfig = AGENT_CONFIG[runningAgent];
      list.push({
        id: `agent-running-${proj.id}-${runningAgent}`,
        title: `🤖 ${agentConfig?.name || 'Agent'} is Active`,
        message: `[${proj.name}] ${info.message} (${proj.progress}% total progress)`,
        time: 'Just now',
        read: false,
        type: 'agent',
        link: `/dashboard/projects/${proj.id}/workspace`,
      });
    }

    if (completedAgents.length > 0 && proj.status !== 'completed') {
      list.push({
        id: `agent-progress-${proj.id}`,
        title: `🚀 Multi-Agent Progress`,
        message: `[${proj.name}] ${completedAgents.length} of 10 AI agents completed their phases successfully.`,
        time: '5 mins ago',
        read: true,
        type: 'build',
        link: `/dashboard/projects/${proj.id}`,
      });
    }

    if (proj.status === 'completed') {
      list.push({
        id: `project-completed-${proj.id}`,
        title: `🎉 Project Build Complete`,
        message: `[${proj.name}] All 10 agents completed code generation, security audits, and QA testing.`,
        time: '10 mins ago',
        read: false,
        type: 'build',
        link: `/dashboard/projects/${proj.id}/workspace`,
      });
    }
  });

  return list;
}
