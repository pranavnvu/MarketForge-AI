// ============================================
// DevForge AI — Auth Layout
// ============================================

import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { APP_NAME } from '@/lib/constants';

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/25 transition-shadow group-hover:shadow-purple-500/40">
            <span className="text-lg font-bold text-white">⚡</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">{APP_NAME}</span>
        </Link>

        {/* Auth Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
