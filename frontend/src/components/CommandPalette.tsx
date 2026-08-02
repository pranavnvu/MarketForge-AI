// ============================================
// DevForge AI — Global Command Palette (Cmd+K)
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderKanban, Bot, Plus, Key, CreditCard, Settings, X } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { ROUTES } from '@/lib/constants';

const commands = [
  { label: 'New Project', path: ROUTES.NEW_PROJECT, icon: Plus, category: 'Actions' },
  { label: 'Go to Dashboard', path: ROUTES.DASHBOARD, icon: FolderKanban, category: 'Navigation' },
  { label: 'Go to Projects', path: ROUTES.PROJECTS, icon: FolderKanban, category: 'Navigation' },
  { label: 'View AI Agents', path: ROUTES.AGENTS, icon: Bot, category: 'Navigation' },
  { label: 'API Keys', path: ROUTES.API_KEYS, icon: Key, category: 'Settings' },
  { label: 'Billing & Usage', path: ROUTES.BILLING, icon: CreditCard, category: 'Settings' },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: Settings, category: 'Settings' },
];

export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    setCommandPaletteOpen(false);
    setQuery('');
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden"
        >
          {/* Input Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              onClick={() => setCommandPaletteOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="p-2 max-h-80 overflow-y-auto space-y-1">
            {filteredCommands.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-500">No matching commands found.</p>
            ) : (
              filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.path + cmd.label}
                    onClick={() => handleSelect(cmd.path)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs text-slate-300 hover:bg-purple-500/20 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-purple-400" />
                      <span className="font-medium">{cmd.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{cmd.category}</span>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
