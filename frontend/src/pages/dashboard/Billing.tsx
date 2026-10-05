// DevForge AI — Billing Page
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, Zap, Loader2 } from 'lucide-react';
import { PRICING_PLANS } from '@/lib/constants';
import { useLifetimeUsage } from '@/hooks/use-lifetime-usage';
import { billingClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState('Pro');
  const lifetimeUsage = useLifetimeUsage();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  
  const { user, updateUser } = useAuthStore();
  const isPro = user?.role === 'pro';
  const isQuotaExceeded = !isPro && lifetimeUsage.isQuotaExceeded;

  useEffect(() => {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get('session_id');
    if (sessionId) {
      setIsCheckoutLoading(true);
      billingClient.verifySession(sessionId)
        .then((data) => {
          if (data.success) {
            updateUser({ role: 'pro' });
            alert('Payment Successful! You are now on the Pro Plan.');
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            alert('Payment not completed.');
          }
        })
        .catch(console.error)
        .finally(() => setIsCheckoutLoading(false));
    }
  }, [updateUser]);

  const handleCheckout = async (planName: string) => {
    if (planName === 'Starter') return;
    setIsCheckoutLoading(true);
    try {
      const data = await billingClient.createCheckoutSession();
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert('Failed to start checkout session. Check your Stripe keys.');
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and usage.</p>
      </div>

      {/* Current Plan */}
      <div className={`rounded-2xl border ${isPro ? 'border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-cyan-500/10' : 'border-primary/30 bg-primary/5'} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isPro ? 'bg-purple-500/20' : 'bg-primary/10'}`}>
              <CreditCard className={`h-6 w-6 ${isPro ? 'text-purple-500' : 'text-primary'}`} />
            </div>
            <div>
              <p className="text-lg font-semibold">{isPro ? 'Pro Plan' : 'Starter Plan'}</p>
              <p className="text-sm text-muted-foreground">{isPro ? 'Unlimited projects · All 3 agents' : '3 projects per month · Basic agents'}</p>
            </div>
          </div>
          {!isPro && (
            <button onClick={() => handleCheckout('Pro')} disabled={isCheckoutLoading} className="rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 disabled:opacity-50">
              {isCheckoutLoading ? 'Loading...' : 'Upgrade to Pro'}
            </button>
          )}
          {isPro && (
            <span className="rounded-xl bg-purple-500/10 border border-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-400">
              Active Subscription
            </span>
          )}
        </div>
      </div>

      {/* Usage */}
      <div className={`rounded-2xl border ${isQuotaExceeded ? 'border-red-500/50 bg-red-500/5' : 'border-border/50 bg-card/50'} p-6 backdrop-blur-sm`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Lifetime Usage</h2>
          {isQuotaExceeded && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500">
              Quota Exceeded — Please Upgrade
            </span>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Campaigns', used: lifetimeUsage.projects, total: isPro ? 'Unlimited' : 3 },
            { label: 'Words Generated', used: lifetimeUsage.tokens, total: isPro ? 'Unlimited' : 50000 },
            { label: 'API Calls', used: lifetimeUsage.apiCalls, total: isPro ? 'Unlimited' : 1000 },
          ].map((item) => {
            const isUnlimited = item.total === 'Unlimited';
            const progress = isUnlimited ? 100 : Math.min((item.used / (item.total as number)) * 100, 100);
            const isOverQuota = !isUnlimited && item.used >= (item.total as number);
            return (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={`font-medium ${isOverQuota ? 'text-red-500' : ''}`}>
                  {item.used.toLocaleString()} {isUnlimited ? '' : `/ ${(item.total as number).toLocaleString()}`}
                  {isUnlimited && <span className="ml-1 text-purple-400">/ ∞</span>}
                </span>
              </div>
              <div className="h-2 rounded-full bg-accent">
                <div className={`h-full rounded-full ${isOverQuota ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-cyan-500'}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PRICING_PLANS.map((plan, i) => (
            <motion.div 
              key={plan.name} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedPlan(plan.name)}
              className={`cursor-pointer rounded-2xl border p-6 transition-all flex flex-col ${selectedPlan === plan.name ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' : 'border-border/50 bg-card/50 hover:border-border hover:bg-accent/50'}`}>
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
              <div className="mt-auto pt-6">
                <button 
                  onClick={() => {
                    if (plan.name === 'Starter') return;
                    if (plan.name === 'Pro') handleCheckout('Pro');
                    if (plan.name === 'Enterprise') window.location.href = 'mailto:sales@marketforge.ai?subject=Enterprise Plan Inquiry';
                  }}
                  disabled={plan.name === 'Pro' && isCheckoutLoading}
                  className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-colors shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 ${
                    plan.name === 'Starter' && isPro 
                      ? 'bg-muted text-muted-foreground cursor-default' 
                      : plan.name === 'Starter' && !isPro
                      ? 'bg-muted text-muted-foreground cursor-default'
                      : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                  } disabled:opacity-50`}
                >
                  {plan.name === 'Pro' && isCheckoutLoading ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Processing...</span>
                  ) : plan.name === 'Starter' && !isPro ? (
                    'Current Plan'
                  ) : plan.name === 'Starter' && isPro ? (
                    'Downgrade'
                  ) : isPro && plan.name === 'Pro' ? (
                    'Current Plan'
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
