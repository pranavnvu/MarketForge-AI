// ============================================
// DevForge AI — Landing Page (Placeholder)
// Will be fully built in Phase 3
// ============================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Bot, GitBranch, Zap } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/25">
              <span className="text-base font-bold">⚡</span>
            </div>
            <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-2 text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center pt-16 overflow-hidden">
        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px] animate-pulse" />
          <div className="absolute -right-40 bottom-20 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300"
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered Software Development
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl"
          >
            Build Software with
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI Engineering Teams
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed"
          >
            Describe your software idea and watch 10 specialized AI agents collaborate
            to design, build, test, and deploy your entire application — in minutes, not months.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-8 py-3.5 text-base font-semibold shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
            >
              Start Building Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-base font-semibold hover:bg-white/5 transition-colors"
            >
              View Demo
            </Link>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { icon: Bot, label: '10 AI Agents' },
              { icon: GitBranch, label: 'GitHub Integration' },
              { icon: Zap, label: 'Real-time Updates' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
              >
                <item.icon className="h-4 w-4 text-purple-400" />
                {item.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
