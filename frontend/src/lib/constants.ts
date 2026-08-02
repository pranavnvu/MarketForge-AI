// ============================================
// DevForge AI — App Constants
// ============================================

export const APP_NAME = 'DevForge AI';
export const APP_DESCRIPTION = 'Autonomous Multi-Agent Software Engineering Platform';
export const APP_VERSION = '1.0.0';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

// ---- Route Paths ----
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // Dashboard
  DASHBOARD: '/dashboard',
  PROJECTS: '/dashboard/projects',
  PROJECT_DETAIL: '/dashboard/projects/:id',
  PROJECT_WORKSPACE: '/dashboard/projects/:id/workspace',
  AGENTS: '/dashboard/agents',
  HISTORY: '/dashboard/history',
  API_KEYS: '/dashboard/api-keys',
  BILLING: '/dashboard/billing',
  SETTINGS: '/dashboard/settings',
  ADMIN: '/dashboard/admin',
  SEARCH: '/dashboard/search',

  // Workspace
  NEW_PROJECT: '/dashboard/projects/new',
} as const;

// ---- Agent Configuration ----
export const AGENT_CONFIG = {
  product_manager: {
    name: 'Product Manager',
    icon: '📋',
    color: '#8B5CF6',
    description: 'Gathers requirements, writes user stories, defines acceptance criteria',
  },
  architect: {
    name: 'Architect',
    icon: '🏗️',
    color: '#06B6D4',
    description: 'Designs system architecture, APIs, database schema, tech stack selection',
  },
  planner: {
    name: 'Planner',
    icon: '📊',
    color: '#F59E0B',
    description: 'Breaks project into tasks, creates dependency graph, sprint planning',
  },
  backend_dev: {
    name: 'Backend Developer',
    icon: '⚙️',
    color: '#10B981',
    description: 'Builds APIs, database models, authentication, business logic',
  },
  frontend_dev: {
    name: 'Frontend Developer',
    icon: '🎨',
    color: '#EC4899',
    description: 'Creates UI components, pages, responsive layouts, styling',
  },
  qa_engineer: {
    name: 'QA Engineer',
    icon: '🧪',
    color: '#EF4444',
    description: 'Writes test cases, unit tests, integration tests, generates bug reports',
  },
  security_analyst: {
    name: 'Security Analyst',
    icon: '🔒',
    color: '#F97316',
    description: 'Vulnerability scanning, secret detection, OWASP compliance checks',
  },
  code_reviewer: {
    name: 'Code Reviewer',
    icon: '👁️',
    color: '#6366F1',
    description: 'Reviews code quality, suggests refactoring, enforces best practices',
  },
  documentation: {
    name: 'Documentation Writer',
    icon: '📝',
    color: '#14B8A6',
    description: 'Generates README, API documentation, user guides',
  },
  devops: {
    name: 'DevOps Engineer',
    icon: '🚀',
    color: '#A855F7',
    description: 'Creates Docker setup, CI/CD pipelines, deployment configurations',
  },
} as const;

// ---- Project Status Config ----
export const PROJECT_STATUS_CONFIG = {
  draft: { label: 'Draft', color: '#6B7280', bgColor: '#F3F4F6' },
  planning: { label: 'Planning', color: '#8B5CF6', bgColor: '#EDE9FE' },
  in_progress: { label: 'In Progress', color: '#3B82F6', bgColor: '#DBEAFE' },
  testing: { label: 'Testing', color: '#F59E0B', bgColor: '#FEF3C7' },
  review: { label: 'Under Review', color: '#EC4899', bgColor: '#FCE7F3' },
  completed: { label: 'Completed', color: '#10B981', bgColor: '#D1FAE5' },
  failed: { label: 'Failed', color: '#EF4444', bgColor: '#FEE2E2' },
} as const;

// ---- Pricing Plans ----
export const PRICING_PLANS = [
  {
    name: 'Starter',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying out DevForge AI',
    features: [
      '3 projects per month',
      'Basic AI agents',
      'Community support',
      '1 workspace',
      'Code export',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'For professional developers and small teams',
    features: [
      'Unlimited projects',
      'All 10 AI agents',
      'Priority support',
      '5 workspaces',
      'GitHub integration',
      'Custom templates',
      'Advanced analytics',
      'Team collaboration',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For organizations that need advanced features',
    features: [
      'Everything in Pro',
      'Unlimited workspaces',
      'Custom AI models',
      'SSO / SAML',
      'Audit logs',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
] as const;

// ---- Keyboard Shortcuts ----
export const KEYBOARD_SHORTCUTS = {
  SEARCH: { key: 'k', modifier: 'meta', label: '⌘K — Search' },
  NEW_PROJECT: { key: 'n', modifier: 'meta', label: '⌘N — New Project' },
  SETTINGS: { key: ',', modifier: 'meta', label: '⌘, — Settings' },
  TOGGLE_SIDEBAR: { key: 'b', modifier: 'meta', label: '⌘B — Toggle Sidebar' },
  TOGGLE_THEME: { key: 'd', modifier: 'meta+shift', label: '⌘⇧D — Toggle Theme' },
} as const;
