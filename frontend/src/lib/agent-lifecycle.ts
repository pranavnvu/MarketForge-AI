// ============================================
// DevForge AI — Dynamic Agent Lifecycle Helper
// ============================================

import { AGENT_CONFIG } from '@/lib/constants';
import type { AgentType, Project } from '@/types';

export type SingleAgentStatus = 'running' | 'idle' | 'completed' | 'waiting';

export interface ProjectAgentInfo {
  status: SingleAgentStatus;
  progress: number;
  message: string;
}

/**
 * Calculates exact agent status, progress percentage, and active task description
 * for a specific project based on its status and progress.
 */
export function getProjectAgentStatuses(project: Project): Record<AgentType, ProjectAgentInfo> {
  const status = project.status;
  const progress = project.progress ?? 0;
  const result: Partial<Record<AgentType, ProjectAgentInfo>> = {};

  const allAgentKeys = Object.keys(AGENT_CONFIG) as AgentType[];

  for (const key of allAgentKeys) {
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
