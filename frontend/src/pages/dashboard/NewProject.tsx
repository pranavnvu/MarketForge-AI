// DevForge AI — New Project Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Check, Loader2 } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useCreateProject } from '@/hooks/use-projects';

const steps = ['Describe', 'Configure', 'Review'];

export default function NewProject() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetUsers: '',
    techStack: 'fullstack',
    language: 'typescript',
    deployTarget: 'docker',
  });

  const createMutation = useCreateProject();

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setCurrentStep(0);
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={ROUTES.PROJECTS} className="rounded-lg p-2 hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-sm text-muted-foreground">Describe your idea and let AI agents build it.</p>
        </div>
      </div>

      {/* Error alert */}
      {createMutation.isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {(createMutation.error as any)?.response?.data?.detail ||
            (createMutation.error as any)?.response?.data?.message ||
            'Failed to create project. Please try again.'}
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              i < currentStep ? 'bg-emerald-500 text-white' : i === currentStep ? 'bg-primary text-white' : 'bg-accent text-muted-foreground'
            }`}>
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
            {i < steps.length - 1 && <div className="mx-2 h-px w-12 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Project Name *</label>
                <input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Expense Tracker App" className="w-full rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Describe Your Idea</label>
                <textarea rows={5} value={formData.description} onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe the software you want to build. Be as detailed as possible — what features should it have? Who are the target users?"
                  className="w-full rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Target Users</label>
                <input type="text" value={formData.targetUsers} onChange={(e) => updateField('targetUsers', e.target.value)}
                  placeholder="e.g. Small business owners, freelancers" className="w-full rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Tech Stack</label>
                <div className="grid grid-cols-2 gap-2">
                  {['fullstack', 'frontend', 'backend', 'mobile'].map((opt) => (
                    <button key={opt} onClick={() => updateField('techStack', opt)}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium capitalize transition-colors ${formData.techStack === opt ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 hover:bg-accent'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Primary Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {['typescript', 'python', 'go', 'rust', 'java', 'csharp'].map((lang) => (
                    <button key={lang} onClick={() => updateField('language', lang)}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium capitalize transition-colors ${formData.language === lang ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 hover:bg-accent'}`}>
                      {lang === 'csharp' ? 'C#' : lang}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Deployment Target</label>
                <div className="grid grid-cols-3 gap-2">
                  {['docker', 'vercel', 'aws', 'railway', 'heroku', 'none'].map((opt) => (
                    <button key={opt} onClick={() => updateField('deployTarget', opt)}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium capitalize transition-colors ${formData.deployTarget === opt ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 hover:bg-accent'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="text-lg font-semibold">Review Your Project</h3>
              <div className="space-y-3 rounded-xl bg-accent/30 p-4">
                {[
                  { label: 'Name', value: formData.name || '—' },
                  { label: 'Description', value: formData.description || '—' },
                  { label: 'Target Users', value: formData.targetUsers || '—' },
                  { label: 'Tech Stack', value: formData.techStack },
                  { label: 'Language', value: formData.language },
                  { label: 'Deploy To', value: formData.deployTarget },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium capitalize max-w-xs text-right truncate">{String(value)}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                10 AI agents will collaboratively build your project. This typically takes 5-15 minutes.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0 || createMutation.isPending}
          className="rounded-xl border border-border/50 px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Back
        </button>
        {currentStep < steps.length - 1 ? (
          <button onClick={() => setCurrentStep(currentStep + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            Next <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={createMutation.isPending || !formData.name.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow disabled:opacity-50">
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating Project...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Start Building
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
