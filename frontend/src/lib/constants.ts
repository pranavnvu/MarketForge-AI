// ============================================
// MarketForge AI — App Constants
// ============================================

export const APP_NAME = 'MarketForge AI';
export const APP_DESCRIPTION = 'Autonomous Multi-Agent Marketing Agency Platform';
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
  strategist: {
    name: 'The Strategist',
    icon: '🧠',
    color: '#3B82F6',
    endpoint: 'POST /agents/strategist',
    description: 'Plans the 30-day content calendar, defines target demographics, and establishes the brand voice.',
  },
  copywriter: {
    name: 'The Copywriter',
    icon: '✍️',
    color: '#10B981',
    endpoint: 'POST /agents/copywriter',
    description: 'Writes the actual blog posts, tweet threads, email newsletters, and ad copy based on the strategy.',
  },
  seo_reviewer: {
    name: 'SEO & Brand Reviewer',
    icon: '🕵️',
    color: '#8B5CF6',
    endpoint: 'POST /agents/seo_reviewer',
    description: 'Audits the copy for SEO keywords, readability, brand safety, and consistency before outputting final assets.',
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
    description: 'Perfect for trying out MarketForge AI',
    features: [
      '3 campaigns per month',
      'Basic AI agents',
      'Community support',
      'Export campaigns',
      '50,000 words limit',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'For professional marketers and small teams',
    features: [
      'Unlimited campaigns',
      'All 3 AI agents',
      'Priority support',
      'Unlimited words',
      'Brand voice templates',
      'Advanced analytics',
      'Team collaboration',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For organizations that need advanced features',
    features: [
      'Everything in Pro',
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
  NEW_PROJECT: { key: 'n', modifier: 'meta', label: '⌘N — New Campaign' },
  SETTINGS: { key: ',', modifier: 'meta', label: '⌘, — Settings' },
  TOGGLE_SIDEBAR: { key: 'b', modifier: 'meta', label: '⌘B — Toggle Sidebar' },
  TOGGLE_THEME: { key: 'd', modifier: 'meta+shift', label: '⌘⇧D — Toggle Theme' },
} as const;
