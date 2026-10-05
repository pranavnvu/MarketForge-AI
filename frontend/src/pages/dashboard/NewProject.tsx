// DevForge AI — Interactive Project Creator Wizard
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useCreateProject } from '@/hooks/use-projects';

export default function NewProject() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetUsers: '',
  });

  const createMutation = useCreateProject();

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) return;

    createMutation.mutate({
      name: formData.name,
      description: formData.description,
      targetUsers: formData.targetUsers,
      techStack: 'fullstack', // default assumptions
      language: 'typescript',
      deployTarget: 'docker',
      disabledAgents: [],
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={ROUTES.PROJECTS} className="rounded-xl border border-border/50 p-2.5 hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interactive Campaign Creator</h1>
          <p className="text-sm text-muted-foreground">Define your marketing vision and let the agents figure out the rest.</p>
        </div>
      </div>

      {/* Error alert */}
      {createMutation.isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
          {(createMutation.error as any)?.response?.data?.detail ||
            (createMutation.error as any)?.response?.data?.message ||
            'Failed to create project. Please try again.'}
        </div>
      )}

      {/* Single Step Content Card */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Campaign Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g. Smart Coffee Mug Launch Campaign"
              className="w-full rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Describe the Campaign / Product *
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe your product and marketing goals. What are we selling? (e.g. A new smart coffee mug that keeps drinks hot for 12 hours. We need a 30-day launch campaign with social media teasers and email newsletters.)"
              className="w-full rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Target Audience / Demographics
            </label>
            <input
              type="text"
              value={formData.targetUsers}
              onChange={(e) => updateField('targetUsers', e.target.value)}
              placeholder="e.g. Remote workers, tech enthusiasts, coffee lovers"
              className="w-full rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border/40 mt-4 gap-4">
          <p className="text-xs text-muted-foreground">
            Click <strong>Dispatch 3-Agent Team</strong> to start the LangGraph engine. You can chat with the agents to refine strategy, content, and branding later.
          </p>
          <button
            type="submit"
            disabled={createMutation.isPending || !formData.name.trim()}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Dispatching Swarm...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Dispatch 3-Agent Team
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
