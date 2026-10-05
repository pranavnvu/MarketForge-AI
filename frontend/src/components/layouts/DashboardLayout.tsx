import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  History,
  Key,
  CreditCard,
  Settings,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useProjects } from '@/hooks/use-projects';
import { cleanImageUrl, isDirectImage } from '@/lib/avatar-helper';
import { generateLiveProjectNotifications, type DynamicNotificationItem } from '@/lib/agent-lifecycle';
import { CommandPalette } from '@/components/CommandPalette';
import { APP_NAME, ROUTES } from '@/lib/constants';

// Notification items type
type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'agent' | 'security' | 'build' | 'system';
  link?: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Multi-Agent Pipeline Active',
    message: 'Backend Dev & Architect agents generated core database schemas & API routes.',
    time: '2 mins ago',
    read: false,
    type: 'agent',
    link: ROUTES.PROJECTS,
  },
  {
    id: 'n2',
    title: 'Security Scan Passed',
    message: 'OWASP scanner completed code vulnerability check with 0 critical alerts.',
    time: '15 mins ago',
    read: false,
    type: 'security',
    link: ROUTES.HISTORY,
  },
  {
    id: 'n3',
    title: 'Profile Settings Updated',
    message: 'Your account credentials and avatar picture were synchronized cleanly.',
    time: '1 hour ago',
    read: false,
    type: 'system',
    link: ROUTES.SETTINGS,
  },
];

// ---- Sidebar Navigation Items ----
const sidebarItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.PROJECTS, label: 'Campaigns', icon: FolderKanban },
  { path: ROUTES.AGENTS, label: 'Agents', icon: Bot },
  { path: ROUTES.HISTORY, label: 'History', icon: History },
  { path: ROUTES.API_KEYS, label: 'API Keys', icon: Key },
  { path: ROUTES.BILLING, label: 'Billing', icon: CreditCard },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

// ---- Sidebar Component ----
function Sidebar() {
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebarCollapse } = useUIStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-border/50">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
          <span className="text-sm font-bold text-white">⚡</span>
        </div>
        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-lg font-bold tracking-tight whitespace-nowrap"
            >
              {APP_NAME}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }
              `}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                }`}
              />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 h-8 w-1 rounded-r-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="border-t border-border/50 p-3">
        <button
          onClick={toggleSidebarCollapse}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

// ---- Mobile Sidebar ----
function MobileSidebar() {
  const location = useLocation();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-border/50 bg-card lg:hidden"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
                  <span className="text-sm font-bold text-white">⚡</span>
                </div>
                <span className="text-lg font-bold">{APP_NAME}</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ---- Top Bar ----
function TopBar() {
  const { theme, setTheme, setSidebarOpen, setCommandPaletteOpen } = useUIStore();
  const { user } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjects();

  const handleLogout = () => {
    queryClient.clear(); // Clear all cached projects and data
    logout();
  };

  const [notifications, setNotifications] = useState<DynamicNotificationItem[]>(initialNotifications);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const notifRef = useRef<HTMLDivElement>(null);

  // Synchronize live agent notifications dynamically when projects or agent phases change
  useEffect(() => {
    if (projects && projects.length > 0) {
      const liveNotifs = generateLiveProjectNotifications(projects);
      setNotifications((prev) => {
        const prevReadSet = new Set(prev.filter((p) => p.read).map((p) => p.id));
        const merged = liveNotifs.map((n) => ({
          ...n,
          read: prevReadSet.has(n.id) ? true : n.read,
        }));
        return merged;
      });
    }
  }, [projects]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Click outside to close notification popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    return true;
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 hover:bg-accent lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 rounded-xl border border-border/50 bg-accent/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-4 rounded bg-background px-1.5 py-0.5 text-xs font-mono border border-border/50">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* User Menu */}
        <div className="ml-2 flex items-center gap-3 border-l border-border/50 pl-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-sm font-bold text-white overflow-hidden shadow-sm border border-border/40">
            {user?.avatar && typeof user.avatar === 'string' && isDirectImage(user.avatar) ? (
              <img
                src={cleanImageUrl(user.avatar)}
                alt={user?.name || 'User'}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="h-full w-full object-cover"
              />
            ) : user?.avatar ? (
              <span>{user.avatar}</span>
            ) : (
              <span>{(user?.name?.[0] || 'P').toUpperCase()}</span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ---- Main Dashboard Layout ----
export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <MobileSidebar />
      <CommandPalette />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
