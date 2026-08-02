// DevForge AI — Settings Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Globe, Trash2 } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Globe },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useUIStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your account and preferences.</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tabs */}
        <nav className="flex lg:flex-col gap-1 lg:w-52 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}>
                <Icon className="h-4 w-4" />{tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-lg font-semibold">Profile Settings</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-sm font-medium">Full Name</label>
                  <input type="text" defaultValue="John Doe" className="w-full rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" /></div>
                <div><label className="mb-1.5 block text-sm font-medium">Email</label>
                  <input type="email" defaultValue="john@example.com" className="w-full rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" /></div>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium">Bio</label>
                <textarea rows={3} defaultValue="Full-stack developer passionate about AI." className="w-full rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" /></div>
              <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Save Changes</button>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-lg font-semibold">Appearance</h2>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Choose your preferred theme.</p>
                <div className="flex gap-3">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button key={t} onClick={() => setTheme(t)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${theme === t ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 hover:bg-accent'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab !== 'profile' && activeTab !== 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {tabs.find((t) => t.id === activeTab)?.label} settings will be available in Phase 2.
              </p>
            </motion.div>
          )}

          {/* Danger Zone */}
          {activeTab === 'profile' && (
            <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <h3 className="font-semibold text-destructive">Danger Zone</h3>
              <p className="mt-1 text-sm text-muted-foreground">Permanently delete your account and all data.</p>
              <button className="mt-3 inline-flex items-center gap-2 rounded-xl border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="h-4 w-4" />Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
