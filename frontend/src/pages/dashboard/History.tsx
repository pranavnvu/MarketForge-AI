// DevForge AI — History Page
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const mockHistory = [
  { id: '1', project: 'Task Management Tool', status: 'completed', date: '2024-01-10', duration: '12m 34s', agents: 10, files: 45 },
  { id: '2', project: 'Blog Platform', status: 'completed', date: '2024-01-08', duration: '8m 12s', agents: 10, files: 32 },
  { id: '3', project: 'Weather Dashboard', status: 'failed', date: '2024-01-06', duration: '4m 56s', agents: 5, files: 12 },
  { id: '4', project: 'Chat Application', status: 'completed', date: '2024-01-04', duration: '15m 22s', agents: 10, files: 58 },
];

const statusIcons = { completed: CheckCircle, failed: XCircle, cancelled: AlertCircle };
const statusColors = { completed: 'text-emerald-500', failed: 'text-red-500', cancelled: 'text-amber-500' };

export default function History() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project History</h1>
        <p className="text-sm text-muted-foreground">View past project executions and outcomes.</p>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="grid grid-cols-6 gap-4 border-b border-border/50 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span className="col-span-2">Project</span><span>Status</span><span>Duration</span><span>Agents</span><span>Files</span>
        </div>
        {mockHistory.map((item, i) => {
          const Icon = statusIcons[item.status as keyof typeof statusIcons] || Clock;
          const colorClass = statusColors[item.status as keyof typeof statusColors] || 'text-muted-foreground';
          return (
            <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="grid grid-cols-6 gap-4 items-center px-5 py-4 border-b border-border/20 hover:bg-accent/30 transition-colors cursor-pointer">
              <div className="col-span-2">
                <p className="font-medium">{item.project}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-sm ${colorClass}`}><Icon className="h-4 w-4" />{item.status}</span>
              <span className="text-sm">{item.duration}</span>
              <span className="text-sm">{item.agents}</span>
              <span className="text-sm">{item.files} files</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
