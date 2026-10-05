// ============================================
// DevForge AI — Type Definitions
// ============================================

// ---- User ----
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: 'user' | 'admin' | 'pro';
  isVerified: boolean;
  oauthProvider: string | null;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  jobTitle?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Workspace ----
export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  user: User;
}

// ---- Project ----
export type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'in_progress'
  | 'testing'
  | 'review'
  | 'completed'
  | 'failed';

export interface ProjectConfig {
  targetUsers?: string;
  techPreference?: string;
  techStack?: string;
  language?: string;
  programmingLanguage?: string[];
  deploymentTarget?: string;
  deployTarget?: string;
  disabledAgents?: AgentType[];
  [key: string]: any;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  config: ProjectConfig;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Agent ----
export type AgentType =
  | 'architect'
  | 'developer'
  | 'reviewer';

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed' | 'waiting';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  projectId: string;
  description: string;
  icon: string;
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
}

// ---- Task ----
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  projectId: string;
  agentId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dependsOn: string[];
  output: string | null;
  createdAt: string;
  completedAt: string | null;
}

// ---- Execution ----
export interface Execution {
  id: string;
  projectId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt: string | null;
  logs: ExecutionLog[];
  currentAgent: AgentType | null;
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  agentType: AgentType;
  message: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  timestamp: string;
}

// ---- Generated File ----
export interface GeneratedFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  agentType: AgentType;
  createdAt: string;
}

// ---- Notification ----
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link: string | null;
  createdAt: string;
}

// ---- Billing ----
export interface BillingRecord {
  id: string;
  userId: string;
  type: 'subscription' | 'usage' | 'addon';
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

// ---- API Key ----
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

// ---- API Responses ----
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---- Auth ----
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  activeProjects: number;
  completedProjects: number;
  runningAgents: number;
  tokensUsed: number;
  totalCost: number;
  successRate: number;
}

export interface ActivityItem {
  id: string;
  type: 'project_created' | 'agent_completed' | 'code_generated' | 'deployment' | 'error';
  title: string;
  description: string;
  timestamp: string;
  projectId?: string;
}

export interface FileConsistencyMetrics {
  project_id: string;
  api_contract_matched: boolean;
  orm_schemas_aligned: boolean;
  auth_tokens_verified: boolean;
  total_files: number;
  files_synced: boolean;
}

