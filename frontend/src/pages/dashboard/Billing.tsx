// DevForge AI — Billing Page
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, Zap } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/constants';

export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and usage.</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">Free Plan</p>
              <p className="text-sm text-muted-foreground">3 projects per month · Basic agents</p>
            </div>
          </div>
          <button className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25">
            Upgrade to Pro
          </button>
        </div>
      </div>

      {/* Usage */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold mb-4">Current Usage</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Projects', used: 1, total: 3 },
            { label: 'Tokens', used: 24500, total: 50000 },
            { label: 'API Calls', used: 156, total: 1000 },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.used.toLocaleString()} / {item.total.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-accent">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" style={{ width: `${(item.used / item.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PRICING_PLANS.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border p-6 ${plan.popular ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' : 'border-border/50 bg-card/50'}`}>
              {plan.popular && (
                <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <Zap className="h-3 w-3" />Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-4"><span className="text-3xl font-bold">${plan.price}</span><span className="text-muted-foreground">/{plan.period}</span></p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />{f}</li>
                ))}
              </ul>
              <button className={`mt-6 w-full rounded-xl py-2.5 text-sm font-semibold transition-colors ${plan.popular ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25' : 'border border-border hover:bg-accent'}`}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
