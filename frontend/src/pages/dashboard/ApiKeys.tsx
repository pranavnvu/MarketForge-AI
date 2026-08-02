// DevForge AI — API Keys Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';

const mockKeys = [
  { id: '1', name: 'Production API Key', key: 'df_prod_sk_a1b2c3d4e5f6g7h8i9j0', lastUsed: '2 hours ago', created: '2024-01-10' },
  { id: '2', name: 'Development Key', key: 'df_dev_sk_z9y8x7w6v5u4t3s2r1q0', lastUsed: '5 minutes ago', created: '2024-01-15' },
];

export default function ApiKeys() {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const toggleKey = (id: string) => {
    setVisibleKeys((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const maskKey = (key: string) => key.slice(0, 10) + '•'.repeat(20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground">Manage your API keys for external integrations.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow">
          <Plus className="h-4 w-4" />Create New Key
        </button>
      </div>
      <div className="space-y-3">
        {mockKeys.map((apiKey, i) => (
          <motion.div key={apiKey.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Key className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="font-semibold">{apiKey.name}</p>
                  <p className="text-xs text-muted-foreground">Created {apiKey.created} · Last used {apiKey.lastUsed}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleKey(apiKey.id)} className="rounded-lg p-2 hover:bg-accent transition-colors">
                  {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button className="rounded-lg p-2 hover:bg-accent transition-colors"><Copy className="h-4 w-4" /></button>
                <button className="rounded-lg p-2 hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-accent/50 px-3 py-2 font-mono text-sm">
              {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
