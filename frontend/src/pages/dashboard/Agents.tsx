// ============================================
// DevForge AI — Agents Page
// ============================================

import { motion } from 'framer-motion';
import { AGENT_CONFIG } from '@/lib/constants';
import type { AgentType } from '@/types';

export default function Agents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Agents</h1>
        <p className="text-sm text-muted-foreground">
          Your autonomous AI engineering team — 10 specialized agents ready to build.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(AGENT_CONFIG) as [AgentType, typeof AGENT_CONFIG[AgentType]][]).map(
          ([key, agent], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${agent.color}15` }}
                >
                  {agent.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {agent.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Ready
                </span>
                <span className="text-xs text-muted-foreground">0 tasks completed</span>
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
