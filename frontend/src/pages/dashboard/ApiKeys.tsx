// DevForge AI — API Keys Page
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { apiKeysClient } from '../../lib/api-client';

export default function ApiKeys() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const data = await apiKeysClient.list();
      setKeys(data);
    } catch (err) {
      console.error('Failed to fetch keys', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const name = prompt('Enter a name for the new API Key:', 'Development Key');
      if (!name) return;
      const newKey = await apiKeysClient.create(name);
      // Automatically show the full token upon creation since it's the only time it's returned
      newKey.key = newKey.token;
      setKeys([newKey, ...keys]);
      toggleKey(newKey.id);
      alert(`Please copy your new API key now. It won't be shown again:\n\n${newKey.token}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create key.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this key?')) return;
    try {
      await apiKeysClient.delete(id);
      setKeys(keys.filter(k => k.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleKey = (id: string) => {
    setVisibleKeys((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const maskKey = (prefix: string) => prefix.slice(0, 10) + '•'.repeat(20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground">Manage your API keys for external integrations.</p>
        </div>
        <button 
          onClick={handleCreate} 
          disabled={isCreating}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />{isCreating ? 'Creating...' : 'Create New Key'}
        </button>
      </div>
      
      {loading ? (
        <p className="text-muted-foreground">Loading keys...</p>
      ) : keys.length === 0 ? (
        <p className="text-muted-foreground">No API keys found. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {keys.map((apiKey, i) => (
            <motion.div key={apiKey.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Key className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="font-semibold">{apiKey.name}</p>
                    <p className="text-xs text-muted-foreground">Created {new Date(apiKey.created_at).toLocaleDateString()} · {apiKey.last_used_at ? `Last used ${new Date(apiKey.last_used_at).toLocaleDateString()}` : 'Never used'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleKey(apiKey.id)} className="rounded-lg p-2 hover:bg-accent transition-colors">
                    {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={() => {
                      if (apiKey.token) navigator.clipboard.writeText(apiKey.token);
                      else alert('Full key is only available right after creation.');
                    }}
                    className="rounded-lg p-2 hover:bg-accent transition-colors"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(apiKey.id)} className="rounded-lg p-2 hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-accent/50 px-3 py-2 font-mono text-sm">
                {visibleKeys.has(apiKey.id) ? (apiKey.token || apiKey.prefix + '****************') : maskKey(apiKey.prefix)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
