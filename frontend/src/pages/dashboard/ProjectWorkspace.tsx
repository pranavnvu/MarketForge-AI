// ============================================
// MarketForge AI — AI Workspace & Interactive Studio
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  FileCode,
  FileText,
  Terminal as TerminalIcon,
  Kanban,
  Network,
  ListFilter,
  Copy,
  Send,
  Check,
  Users,
  Power,
  PowerOff,
  RefreshCw,
  Plus,
  Download,
  Edit2,
  Save,
  Trash2,
  Play,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  ChevronRight,
  ChevronDown,
  Filter,
  Folder,
  FolderOpen,
  Search,
} from 'lucide-react';
import { ROUTES, AGENT_CONFIG } from '@/lib/constants';
import { useProject, useUpdateProject } from '@/hooks/use-projects';
import {
  getProjectAgentStatuses,
  getDisabledAgentsForProject,
  toggleAgentForProject,
} from '@/lib/agent-lifecycle';
import type { AgentType } from '@/types';
import JSZip from 'jszip';

type WorkspaceFile = {
  path: string;
  language: string;
  agent: string;
  content: string;
};

type ChatMessage = {
  id: string;
  sender: string;
  role?: string;
  text: string;
  time: string;
  codeSnippet?: string;
};

type LogEntry = {
  id: string;
  time: string;
  level: 'info' | 'success' | 'warn' | 'error';
  agent: string;
  message: string;
};

type TaskItem = {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  agent: string;
  priority: 'low' | 'medium' | 'high';
};

type TerminalHistoryItem = {
  id: string;
  command: string;
  output: string[];
  time: string;
};

type TreeNode = {
  name: string;
  fullPath: string;
  isFolder: boolean;
  fileIndex?: number;
  children: TreeNode[];
};

function buildFileTree(files: WorkspaceFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  files.forEach((file, index) => {
    const parts = file.path.split('/');
    let currentLevel = root;

    parts.forEach((part, i) => {
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      let existingNode = currentLevel.find((node) => node.name === part);

      if (!existingNode) {
        existingNode = {
          name: part,
          fullPath: currentPath,
          isFolder: !isLast,
          fileIndex: isLast ? index : undefined,
          children: [],
        };
        currentLevel.push(existingNode);
      }

      currentLevel = existingNode.children;
    });
  });

  return root;
}

function RenderTreeNodes({
  nodes,
  depth = 0,
  expandedFolders,
  toggleFolder,
  selectedFileIndex,
  setSelectedFileIndex,
  setIsEditingCode,
  handleDeleteFile,
}: {
  nodes: TreeNode[];
  depth?: number;
  expandedFolders: Record<string, boolean>;
  toggleFolder: (path: string) => void;
  selectedFileIndex: number;
  setSelectedFileIndex: (idx: number) => void;
  setIsEditingCode: (v: boolean) => void;
  handleDeleteFile: (idx: number, e: React.MouseEvent) => void;
}) {
  return (
    <div className="space-y-0.5" style={{ paddingLeft: depth > 0 ? `${depth * 10}px` : '0px' }}>
      {nodes.map((node) => {
        if (node.isFolder) {
          const isExpanded = expandedFolders[node.fullPath] !== false;
          return (
            <div key={node.fullPath} className="space-y-0.5">
              <button
                onClick={() => toggleFolder(node.fullPath)}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                {isExpanded ? (
                  <FolderOpen className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                ) : (
                  <Folder className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                )}
                <span className="truncate">{node.name}</span>
              </button>
              {isExpanded && node.children.length > 0 && (
                <RenderTreeNodes
                  nodes={node.children}
                  depth={depth + 1}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                  selectedFileIndex={selectedFileIndex}
                  setSelectedFileIndex={setSelectedFileIndex}
                  setIsEditingCode={setIsEditingCode}
                  handleDeleteFile={handleDeleteFile}
                />
              )}
            </div>
          );
        }

        const isSelected = selectedFileIndex === node.fileIndex;
        return (
          <div
            key={node.fullPath}
            onClick={() => {
              if (node.fileIndex !== undefined) {
                setSelectedFileIndex(node.fileIndex);
                setIsEditingCode(false);
              }
            }}
            className={`group flex items-center justify-between rounded-md px-2 py-1 text-xs font-mono transition-colors cursor-pointer ${
              isSelected
                ? 'bg-primary/15 text-primary font-semibold border border-primary/30'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <FileCode
                className={`h-3.5 w-3.5 shrink-0 ${
                  node.name.endsWith('.py')
                    ? 'text-blue-400'
                    : node.name.endsWith('.tsx') || node.name.endsWith('.ts')
                    ? 'text-cyan-400'
                    : 'text-amber-400'
                }`}
              />
              <span className="truncate">{node.name}</span>
            </div>
            {node.fileIndex !== undefined && (
              <button
                onClick={(e) => handleDeleteFile(node.fileIndex!, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-red-400 transition-opacity rounded"
                title="Delete file"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id || '');
  const updateProject = useUpdateProject();

  const [disabledAgents, setDisabledAgents] = useState<AgentType[]>([]);
  const [activeTab, setActiveTab] = useState<
    'assets' | 'chat' | 'reports' | 'agents' | 'logs' | 'tasks' | 'terminal'
  >('assets');

  // UI Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (project) {
      setDisabledAgents(getDisabledAgentsForProject(project));
    }
  }, [project]);


  const projectName = project?.name || 'Project Workspace';
  const projectTech = project?.config?.techStack || 'fullstack';
  const projectLang = project?.config?.language || 'typescript';

  const agentStatuses = project
    ? getProjectAgentStatuses(project)
    : ({} as ReturnType<typeof getProjectAgentStatuses>);

  const handleToggleAgent = (key: AgentType) => {
    if (!project) return;
    const isDisabled = disabledAgents.includes(key);
    const newDisabled = toggleAgentForProject(project, key, isDisabled);
    setDisabledAgents(newDisabled);

    updateProject.mutate({
      id: project.id,
      data: {
        config: {
          ...(project.config || {}),
          disabledAgents: newDisabled,
        },
      },
    });
    showToast(`${AGENT_CONFIG[key].name} ${isDisabled ? 'Enabled' : 'Disabled'} for ${projectName}`);
  };

  // ------------------------------------
  // 1. CODE TAB STATE
  // ------------------------------------
  const [files, setFiles] = useState<WorkspaceFile[]>([
    {
      path: 'strategy/content_calendar.md',
      language: 'markdown',
      agent: 'strategist',
      content: `# ${projectName} - 30 Day Content Calendar\n\n## Week 1: Teaser Phase\n- **Day 1:** Twitter/X Thread dropping hints.\n- **Day 3:** Instagram Reel showing a silhouette.\n- **Day 7:** VIP Email Newsletter reveal.\n\n## Week 2: Hype Phase\n- **Day 10:** Official Blog Post announcement.\n- **Day 14:** Influencer unboxing videos.\n`,
    },
    {
      path: 'assets/hype_blog_post.md',
      language: 'markdown',
      agent: 'copywriter',
      content: `# Introducing the ${projectName}\n\nWelcome to the future. After months of anticipation, we are thrilled to finally pull back the curtain on the **${projectName}**.\n\n### Why it matters\nThis isn't just another product. It's a revolution in how we experience daily life. Built for the modern pioneer, it combines sleek aesthetics with uncompromising performance.\n\n**Available starting next Friday.** Don't miss out.\n`,
    },
    {
      path: 'assets/vip_newsletter.md',
      language: 'markdown',
      agent: 'copywriter',
      content: `Subject: Shhh... You're seeing this first. 🤫\n\nHey VIPs,\n\nYou've been with us since day one, so we wanted you to be the very first to know about the **${projectName}**.\n\nAs a thank you, use code VIPEARLY20 at checkout for 20% off your pre-order.\n\nStay awesome,\nThe Team\n`,
    },
    {
      path: 'assets/twitter_thread.md',
      language: 'markdown',
      agent: 'copywriter',
      content: `🧵 1/5 The wait is over. Meet the ${projectName}.\nWe spent 2 years obsessing over every detail.\nHere is why it will blow your mind 👇\n\n🧵 2/5 First, the design. We went back to the drawing board to create something truly seamless...\n`,
    },
  ]);

  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [codeDraft, setCodeDraft] = useState('');

  // Sync files to DB to recalculate lifetime usage
  useEffect(() => {
    if (!project) return;
    const currentRegistry = project.config?.fileRegistry || {};
    let changed = false;
    const newRegistry = { ...currentRegistry };
    
    files.forEach(f => {
      if (newRegistry[f.path] !== f.content) {
        newRegistry[f.path] = f.content;
        changed = true;
      }
    });

    if (changed) {
      updateProject.mutate({
        id: project.id,
        data: {
          config: {
            ...(project.config || {}),
            fileRegistry: newRegistry
          }
        }
      });
    }
  }, [files, project]);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');

  // Tree building & searching state
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: prev[folderPath] === false ? true : false,
    }));
  };

  const handleDeleteFile = (fileIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const fileToDelete = files[fileIndex];
    if (!fileToDelete) return;

    if (files.length <= 1) {
      showToast('Cannot delete the last remaining file');
      return;
    }

    setFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    if (selectedFileIndex === fileIndex) {
      setSelectedFileIndex(0);
    } else if (selectedFileIndex > fileIndex) {
      setSelectedFileIndex(selectedFileIndex - 1);
    }
    showToast(`Deleted ${fileToDelete.path}`);
  };

  const filteredFiles = files.filter((f) =>
    f.path.toLowerCase().includes(fileSearchQuery.toLowerCase())
  );

  const fileTreeNodes = buildFileTree(filteredFiles);

  const currentFile = files[selectedFileIndex] || files[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Code copied to clipboard!');
  };

  const handleStartEditCode = () => {
    setCodeDraft(currentFile.content);
    setIsEditingCode(true);
  };

  const handleSaveCodeEdit = () => {
    setFiles((prev) =>
      prev.map((f, i) => (i === selectedFileIndex ? { ...f, content: codeDraft } : f))
    );
    setIsEditingCode(false);
    showToast(`Saved changes to ${currentFile.path}`);
  };

  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePath.trim()) return;
    const path = newFilePath.trim();
    const ext = path.split('.').pop() || '';
    const lang = ext === 'py' ? 'python' : ext === 'ts' || ext === 'tsx' ? 'typescript' : 'text';

    const newFile: WorkspaceFile = {
      path,
      language: lang,
      agent: 'User Custom',
      content: `// New File: ${path}\n// Created in ${projectName} Workspace\n`,
    };

    setFiles((prev) => [...prev, newFile]);
    setSelectedFileIndex(files.length);
    setNewFilePath('');
    setShowNewFileModal(false);
    showToast(`Created file ${path}`);
  };

  const handleDownloadCode = async () => {
    try {
      const zip = new JSZip();
      
      files.forEach(f => {
        // Remove leading slash if any and add to zip
        const filePath = f.path.startsWith('/') ? f.path.substring(1) : f.path;
        zip.file(filePath, f.content);
      });
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_assets.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Campaign assets downloaded successfully!');
    } catch (err) {
      console.error('ZIP generation failed', err);
      showToast('Error generating ZIP file.');
    }
  };

  // ------------------------------------
  // 2. CHAT TAB STATE
  // ------------------------------------
  const [selectedAgentTarget, setSelectedAgentTarget] = useState<AgentType | 'all'>('all');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'c1',
      sender: 'The Strategist',
      role: 'CMO / Strategist',
      text: `Hello! I have mapped out the 30-day target demographics and content strategy for ${projectName}. What marketing asset should we draft next?`,
      time: '10:00 AM',
    },
    {
      id: 'c2',
      sender: 'The Copywriter',
      role: 'Marketing Copywriter',
      text: `The initial campaign assets have been generated and saved to your workspace. Let me know if you want any copy adjusted!`,
      time: '10:01 AM',
      codeSnippet: `Drafting: assets/hype_blog_post.md\nDrafting: assets/twitter_thread.md`,
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendChat = (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'You',
      role: 'Lead Architect',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');

    // AI Response Simulation based on targeted agent
    setTimeout(() => {
      const targetAgentKey = selectedAgentTarget === 'all' ? 'backend_dev' : selectedAgentTarget;
      const targetConfig = AGENT_CONFIG[targetAgentKey];

      let aiReplyText = `Received instructions for "${text}". Executing copy updates and verifying strategy alignment.`;
      let snippet: string | undefined = undefined;

      if (text.toLowerCase().includes('email') || text.toLowerCase().includes('newsletter')) {
        aiReplyText = `I will add a new promotional email newsletter for ${projectName}.`;
        snippet = `Subject: Special Offer Inside! 🎁\n\nHey there,\n\nWe are launching ${projectName} very soon! Click here to claim your early bird discount.`;
        // Automatically add to files
        setFiles(prev => [...prev, {
          path: `assets/promo_email_${Date.now()}.md`,
          language: 'markdown',
          agent: 'copywriter',
          content: snippet!
        }]);
      } else if (text.toLowerCase().includes('tweet') || text.toLowerCase().includes('social')) {
        aiReplyText = `Drafting 3 new viral Tweets for ${projectName}.`;
        snippet = `🚀 Big things coming for ${projectName}! We can't wait to share it with you all. #LaunchDay`;
        setFiles(prev => [...prev, {
          path: `assets/social_post_${Date.now()}.md`,
          language: 'markdown',
          agent: 'copywriter',
          content: snippet!
        }]);
      } else if (text.toLowerCase().includes('seo') || text.toLowerCase().includes('audit')) {
        aiReplyText = `Executing SEO scan on the assets. Everything looks highly optimized for search engines.`;
      } else {
        // Generic edit
        setFiles(prev => [...prev, {
          path: `assets/new_asset_${Date.now()}.md`,
          language: 'markdown',
          agent: 'copywriter',
          content: `# New Asset for ${projectName}\n\nBased on your request: "${text}".`
        }]);
      }

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: targetConfig.name,
        role: targetConfig.description,
        text: aiReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeSnippet: snippet,
      };

      setChatMessages((prev) => [...prev, aiReply]);
    }, 1000);
  };

  // ------------------------------------
  // 3. LOGS TAB STATE
  // ------------------------------------
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'l1', time: '10:00:01', level: 'info', agent: 'The Strategist', message: `Analyzing target audience & generating 30-day strategy for ${projectName}...` },
    { id: 'l2', time: '10:00:05', level: 'info', agent: 'The Strategist', message: `Content calendar completed.` },
    { id: 'l3', time: '10:00:12', level: 'info', agent: 'The Copywriter', message: 'Drafting initial marketing assets based on strategy plan.' },
    { id: 'l4', time: '10:00:20', level: 'info', agent: 'The Copywriter', message: 'Generated Blog Post, Twitter Thread, and VIP Newsletter.' },
    { id: 'l5', time: '10:00:35', level: 'info', agent: 'SEO & Brand Reviewer', message: 'Auditing generated assets for brand tone and SEO keywords.' },
    { id: 'l6', time: '10:00:48', level: 'success', agent: 'SEO & Brand Reviewer', message: 'SEO audit completed. Average score: 85/100.' },
    { id: 'l7', time: '10:01:00', level: 'success', agent: 'MarketForge AI', message: 'Campaign pipeline execution successful. Assets ready for download.' },
  ]);

  const [logFilterAgent, setLogFilterAgent] = useState<string>('all');
  const [logFilterLevel, setLogFilterLevel] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (logFilterAgent !== 'all' && log.agent !== logFilterAgent) return false;
    if (logFilterLevel !== 'all' && log.level !== logFilterLevel) return false;
    return true;
  });

  const handleSimulateLog = () => {
    const agentsList = ['The Strategist', 'The Copywriter', 'SEO & Brand Reviewer'];
    const randomAgent = agentsList[Math.floor(Math.random() * agentsList.length)];
    const newLog: LogEntry = {
      id: `l-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      level: Math.random() > 0.8 ? 'warn' : 'info',
      agent: randomAgent,
      message: `Executed automated task check for ${projectName}. Marketing pipeline status nominal.`,
    };
    setLogs((prev) => [...prev, newLog]);
    showToast(`New agent log triggered from ${randomAgent}`);
  };

  const handleClearLogs = () => {
    setLogs([]);
    showToast('Logs cleared');
  };

  const handleDownloadLogs = () => {
    const textContent = logs.map((l) => `[${l.time}] [${l.level.toUpperCase()}] [${l.agent}]: ${l.message}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_logs.txt`;
    a.click();
    showToast('Log file downloaded!');
  };

  // ------------------------------------
  // 4. TASKS KANBAN TAB STATE
  // ------------------------------------
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 't1', title: 'Target Audience Profile Analysis', status: 'done', agent: 'The Strategist', priority: 'high' },
    { id: 't2', title: '30-Day Launch Content Calendar', status: 'done', agent: 'The Strategist', priority: 'high' },
    { id: 't3', title: 'Draft SEO Blog Post', status: 'done', agent: 'The Copywriter', priority: 'high' },
    { id: 't4', title: 'Draft VIP Email Newsletter', status: 'in_progress', agent: 'The Copywriter', priority: 'medium' },
    { id: 't5', title: 'Draft 5-Part Twitter Thread', status: 'in_progress', agent: 'The Copywriter', priority: 'high' },
    { id: 't6', title: 'Brand Tone & Safety Audit', status: 'todo', agent: 'SEO Reviewer', priority: 'medium' },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAgent, setNewTaskAgent] = useState<string>('The Copywriter');

  const handleMoveTask = (taskId: string, nextStatus: 'todo' | 'in_progress' | 'done') => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
    showToast('Task status updated!');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: newTaskTitle.trim(),
      status: 'todo',
      agent: newTaskAgent,
      priority: 'medium',
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle('');
    showToast(`Task created for ${newTaskAgent}`);
  };

  // ------------------------------------
  // 5. TERMINAL TAB STATE
  // ------------------------------------
  const [terminalHistory, setTerminalHistory] = useState<TerminalHistoryItem[]>([
    {
      id: 'term-1',
      command: `marketforge build --project "${projectName}"`,
      output: [
        `[+] Initializing MarketForge AI Multi-Agent Pipeline for ${projectName}...`,
        ` ✔ The Strategist: Target Demographics mapped`,
        ` ✔ The Copywriter: 5 core assets drafted`,
        ` ✔ SEO Reviewer: Brand tone & keyword density verified`,
        `SUCCESS: Marketing pipeline ready. Review your assets in the workspace.`,
      ],
      time: '10:00:00 AM',
    },
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  const handleRunTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    let outputLines: string[] = [];
    const lowerCmd = cmd.toLowerCase();

    if (lowerCmd === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    } else if (lowerCmd === 'help') {
      outputLines = [
        'Available MarketForge Terminal Commands:',
        '  npm test             - Run all unit and integration tests',
        '  python main.py       - Start FastAPI backend dev server',
        '  marketforge build       - Execute full 10-agent pipeline build',
        '  docker-compose up    - Launch Docker containers',
        '  status               - Check active multi-agent pipeline status',
        '  clear                - Clear terminal screen',
      ];
    } else if (lowerCmd.includes('test') || lowerCmd.includes('npm test')) {
      outputLines = [
        `Running pytest & vitest suites for ${projectName}...`,
        `PASSED backend/tests/test_api.py (14 tests)`,
        `PASSED backend/tests/test_auth.py (8 tests)`,
        `PASSED frontend/src/App.test.tsx (12 tests)`,
        `-----------------------------------------------`,
        `Total Coverage: 94.2% | 34 Passed | 0 Failed`,
      ];
    } else if (lowerCmd.includes('python') || lowerCmd.includes('main.py') || lowerCmd.includes('run')) {
      outputLines = [
        `Starting Uvicorn server for ${projectName}...`,
        `INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)`,
        `INFO:     Application startup complete. Database connected.`,
      ];
    } else if (lowerCmd.includes('docker')) {
      outputLines = [
        `Creating network "${projectName.toLowerCase()}_default"...`,
        `Building backend container... SUCCESS`,
        `Building frontend container... SUCCESS`,
        `Attaching to ${projectName.toLowerCase()}-backend-1, ${projectName.toLowerCase()}-frontend-1`,
      ];
    } else if (lowerCmd.includes('status')) {
      outputLines = [
        `Project: ${projectName}`,
        `Agents Active: 10 / 10`,
        `Status: ${project?.status || 'in_progress'}`,
        `Progress: ${project?.progress || 45}%`,
      ];
    } else {
      outputLines = [
        `zsh: command executed: ${cmd}`,
        `[MarketForge AI] Command finished with exit status code 0.`,
      ];
    }

    setTerminalHistory((prev) => [
      ...prev,
      {
        id: `term-${Date.now()}`,
        command: cmd,
        output: outputLines,
        time: new Date().toLocaleTimeString(),
      },
    ]);
    setTerminalInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-4">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-500 border border-emerald-400 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-4 gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.PROJECTS} className="rounded-xl border border-border/50 p-2 hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{projectName} Workspace</h1>
            <p className="text-xs text-muted-foreground">
              Campaign ID: {id} · Status: Active (Generating Assets)
              {disabledAgents.length > 0 && (
                <span className="ml-2 font-semibold text-amber-400">
                  · ({disabledAgents.length} Agent{disabledAgents.length > 1 ? 's' : ''} Disabled)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tab Selection Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-accent/40 p-1 border border-border/40">
          {[
            { id: 'assets', label: 'Marketing Assets', icon: FileCode },
            { id: 'chat', label: 'Agent Chat', icon: MessageSquare },
            { id: 'reports', label: 'Strategy & Audit', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 min-h-0 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex">
        {/* ==================================================== */}
        {/* TAB 1: CODE VIEWER & EDITING */}
        {/* ==================================================== */}
        {activeTab === 'assets' && (
          <div className="flex w-full h-full">
            {/* File Tree Sidebar */}
            <div className="w-64 border-r border-border/50 bg-background/40 p-3 overflow-y-auto shrink-0 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Header & Quick Action Buttons */}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Folder className="h-3.5 w-3.5 text-primary" /> Explorer
                  </p>
                  <button
                    onClick={() => setShowNewFileModal(true)}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/30 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                    title="Add new file"
                  >
                    <Plus className="h-3 w-3" /> New File
                  </button>
                </div>

                {/* Search Filter Input */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    placeholder="Filter files..."
                    className="w-full rounded-lg border border-border/50 bg-background pl-8 pr-2.5 py-1 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Tree View */}
                <div className="mt-2 space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)] pr-1">
                  {fileTreeNodes.length > 0 ? (
                    <RenderTreeNodes
                      nodes={fileTreeNodes}
                      expandedFolders={expandedFolders}
                      toggleFolder={toggleFolder}
                      selectedFileIndex={selectedFileIndex}
                      setSelectedFileIndex={setSelectedFileIndex}
                      setIsEditingCode={setIsEditingCode}
                      handleDeleteFile={handleDeleteFile}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center">No matching files</p>
                  )}
                </div>
              </div>

              {/* Download Code Button */}
              <button
                onClick={handleDownloadCode}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-accent/30 py-2 text-xs font-semibold hover:bg-accent transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Download Campaign Assets
              </button>
            </div>

            {/* Code Content & Editor View */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-semibold">{currentFile.path}</span>
                  <span className="text-[10px] rounded bg-slate-800 px-2 py-0.5 font-mono text-slate-400">
                    {currentFile.language}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {!isEditingCode ? (
                    <button
                      onClick={handleStartEditCode}
                      className="flex items-center gap-1 text-xs text-slate-300 hover:text-primary transition-colors font-medium"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit Code
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveCodeEdit}
                      className="flex items-center gap-1 text-xs bg-emerald-600 px-2.5 py-1 rounded-lg text-white font-semibold hover:bg-emerald-500 transition-colors"
                    >
                      <Save className="h-3.5 w-3.5" /> Save Changes
                    </button>
                  )}
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {isEditingCode ? (
                <textarea
                  value={codeDraft}
                  onChange={(e) => setCodeDraft(e.target.value)}
                  className="flex-1 p-4 font-mono text-xs text-emerald-400 bg-slate-950 focus:outline-none leading-relaxed resize-none"
                />
              ) : (
                <pre className="flex-1 p-4 font-mono text-xs text-slate-200 overflow-auto leading-relaxed">
                  <code>{currentFile.content}</code>
                </pre>
              )}
            </div>

            {/* Modal for Creating New File */}
            {showNewFileModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                <form onSubmit={handleCreateNewFile} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
                  <h3 className="text-lg font-bold">Create New File</h3>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">File Path</label>
                    <input
                      type="text"
                      value={newFilePath}
                      onChange={(e) => setNewFilePath(e.target.value)}
                      placeholder="e.g. backend/app/api/v1/users.py"
                      className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewFileModal(false)}
                      className="rounded-xl border border-border px-3.5 py-2 text-xs font-semibold hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      Create File
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: AGENTS TEAM & CONTROLS */}
        {/* ==================================================== */}
        {activeTab === 'agents' && (
          <div className="p-6 w-full overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h2 className="text-lg font-bold">AI Agent Team Controls — {projectName}</h2>
                <p className="text-xs text-muted-foreground">
                  Enable or disable specific AI agents for this project dynamically at any time.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                {10 - disabledAgents.length} / 10 Agents Active
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.entries(AGENT_CONFIG) as [AgentType, typeof AGENT_CONFIG[AgentType]][]).map(([key, agent]) => {
                const agentStatus = agentStatuses[key] || { status: 'waiting', progress: 0, message: 'Waiting' };
                const isDisabled = agentStatus.status === 'disabled';
                const isCompleted = agentStatus.status === 'completed';
                const isRunning = agentStatus.status === 'running';

                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                      isDisabled
                        ? 'border-border/30 bg-card/20 opacity-50'
                        : isRunning
                        ? 'border-primary/40 bg-primary/5 shadow-sm'
                        : isCompleted
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-border/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{agent.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-xs ${isDisabled ? 'line-through text-muted-foreground' : ''}`}>
                            {agent.name}
                          </p>
                          {isDisabled && (
                            <span className="text-[10px] text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded border border-slate-500/20">
                              Disabled
                            </span>
                          )}
                          {isRunning && (
                            <span className="text-[10px] text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Running
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-semibold">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{agentStatus.message}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleAgent(key)}
                      className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                        isDisabled
                          ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      {isDisabled ? (
                        <>
                          <Power className="h-3 w-3" /> Enable
                        </>
                      ) : (
                        <>
                          <PowerOff className="h-3 w-3" /> Disable
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: AI AGENT TEAM CHAT */}
        {/* ==================================================== */}
        {activeTab === 'chat' && (
          <div className="flex flex-col w-full h-full">
            {/* Target Agent Filter */}
            <div className="flex items-center justify-between border-b border-border/50 p-3 bg-background/40">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold">Talk to AI Agent:</span>
                <select
                  value={selectedAgentTarget}
                  onChange={(e) => setSelectedAgentTarget(e.target.value as any)}
                  className="rounded-lg border border-border/50 bg-background px-2.5 py-1 text-xs font-semibold focus:outline-none"
                >
                  <option value="all">🌟 All Agents (Team Lead)</option>
                  {(Object.keys(AGENT_CONFIG) as AgentType[]).map((key) => (
                    <option key={key} value={key}>
                      {AGENT_CONFIG[key].icon} {AGENT_CONFIG[key].name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Chat Message Stream */}
            <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-foreground">{msg.sender}</span>
                    {msg.role && <span className="text-[10px] text-muted-foreground">({msg.role})</span>}
                    <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs max-w-lg leading-relaxed shadow-xs ${
                      msg.sender === 'You'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-accent/80 text-foreground border border-border/50 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                    {msg.codeSnippet && (
                      <pre className="mt-2 rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto border border-slate-800">
                        <code>{msg.codeSnippet}</code>
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="border-t border-border/50 p-3 flex gap-2 bg-background/50">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={`Instruct ${selectedAgentTarget === 'all' ? 'the agent team' : AGENT_CONFIG[selectedAgentTarget].name} (e.g. Add JWT auth endpoint)...`}
                className="flex-1 rounded-xl border border-border/50 bg-background px-4 py-2.5 text-xs focus:outline-none focus:border-primary"
              />
              <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" /> Send
              </button>
            </form>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: LIVE LOGS STREAM & FILTERS */}
        {/* ==================================================== */}
        {activeTab === 'logs' && (
          <div className="flex flex-col w-full h-full">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-border/50 p-3 bg-background/40 gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold">Agent Filter:</span>
                  <select
                    value={logFilterAgent}
                    onChange={(e) => setLogFilterAgent(e.target.value)}
                    className="rounded-lg border border-border/50 bg-background px-2.5 py-1 text-xs font-semibold"
                  >
                    <option value="all">All Agents</option>
                    <option value="strategist">The Strategist</option>
                    <option value="copywriter">The Copywriter</option>
                    <option value="seo_reviewer">SEO & Brand Reviewer</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">Level:</span>
                  <select
                    value={logFilterLevel}
                    onChange={(e) => setLogFilterLevel(e.target.value)}
                    className="rounded-lg border border-border/50 bg-background px-2.5 py-1 text-xs font-semibold"
                  >
                    <option value="all">All Levels</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateLog}
                  className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 flex items-center gap-1"
                >
                  <Play className="h-3 w-3" /> Simulate Live Log
                </button>
                <button
                  onClick={handleDownloadLogs}
                  className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent flex items-center gap-1"
                >
                  <Download className="h-3 w-3" /> Export Logs
                </button>
                <button
                  onClick={handleClearLogs}
                  className="rounded-xl border border-red-500/30 text-red-400 px-3 py-1.5 text-xs font-semibold hover:bg-red-500/10 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              </div>
            </div>

            {/* Log Stream Container */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 bg-slate-950 text-slate-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-1.5 border-b border-slate-900">
                    <span className="text-slate-500 text-[11px] shrink-0">{log.time}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase shrink-0 ${
                        log.level === 'success'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : log.level === 'warn'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : log.level === 'error'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {log.agent}
                    </span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500">No logs found matching selected filters.</div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: ARCHITECTURE & ER DIAGRAM */}
        {/* ==================================================== */}
        {activeTab === 'reports' && (
          <div className="p-6 w-full overflow-y-auto space-y-6">
            <div>
              <h2 className="text-lg font-bold">Marketing Strategy & Audit Review — {projectName}</h2>
              <p className="text-xs text-muted-foreground">
                Compiled by the Strategist and SEO Reviewer AI agents.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/50 p-5 bg-card/60 space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" /> Target Audience & Strategy Plan
                </h3>
                <div className="rounded-xl border border-slate-800 p-4 bg-slate-950 font-mono text-xs text-cyan-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(project.config?.artifacts?.strategist?.strategy_plan || {
                    campaign_goal: "Maximize reach, engagement, and conversion.",
                    target_audience: "Gen Z, Millennials, Tech Enthusiasts",
                    brand_tone: "Exciting, Urgent, Exclusive",
                    assets_in_pipeline: files.map(f => f.path),
                    execution_status: "Active"
                  }, null, 2)}
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 p-5 bg-card/60 space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> SEO & Brand Audit Report
                </h3>
                <div className="rounded-xl border border-slate-800 p-4 bg-slate-950 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(project.config?.artifacts?.seo_reviewer?.review_report || {
                    seo_score: Math.min(100, 60 + files.length * 8),
                    assets_analyzed: files.length,
                    total_words_analyzed: files.reduce((acc, f) => acc + (f.content.trim() ? f.content.trim().split(/\s+/).length : 0), 0),
                    keyword_density: "Optimal (2.4%)",
                    brand_safety: "Passed",
                    recommendations: files.length < 5 
                      ? ["Add more social media posts to increase reach.", "Draft an SEO-optimized landing page."] 
                      : ["Great variety of assets.", "Ensure call-to-actions are placed above the fold."]
                  }, null, 2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: TASKS KANBAN BOARD */}
        {/* ==================================================== */}
        {activeTab === 'tasks' && (
          <div className="p-6 w-full overflow-y-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-4 gap-3">
              <div>
                <h2 className="text-lg font-bold">Sprint Task Kanban Board — {projectName}</h2>
                <p className="text-xs text-muted-foreground">
                  Track and assign multi-agent execution tasks in real-time.
                </p>
              </div>

              {/* Add New Task Form */}
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="New task title..."
                  className="rounded-xl border border-border/50 bg-background px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                />
                <select
                  value={newTaskAgent}
                  onChange={(e) => setNewTaskAgent(e.target.value)}
                  className="rounded-xl border border-border/50 bg-background px-2.5 py-1.5 text-xs font-semibold"
                >
                  <option value="The Strategist">The Strategist</option>
                  <option value="The Copywriter">The Copywriter</option>
                  <option value="SEO Reviewer">SEO Reviewer</option>
                </select>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 flex items-center gap-1"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Add Task
                </button>
              </form>
            </div>

            {/* Kanban Columns */}
            <div className="grid gap-4 md:grid-cols-3">
              {(['todo', 'in_progress', 'done'] as const).map((colStatus) => {
                const colTasks = tasks.filter((t) => t.status === colStatus);
                const colTitle = colStatus === 'todo' ? '📋 To Do' : colStatus === 'in_progress' ? '⚡ In Progress' : '✅ Completed';

                return (
                  <div key={colStatus} className="rounded-2xl border border-border/50 p-4 bg-card/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">{colTitle}</h3>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold">{colTasks.length}</span>
                    </div>

                    <div className="space-y-2.5">
                      {colTasks.map((t) => (
                        <div key={t.id} className="rounded-xl border border-border/60 bg-card p-3 shadow-xs space-y-2">
                          <p className="font-bold text-xs text-foreground">{t.title}</p>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Assignee: <strong className="text-primary">{t.agent}</strong></span>
                          </div>
                          <div className="flex justify-end gap-1 pt-1 border-t border-border/30">
                            {colStatus !== 'todo' && (
                              <button
                                onClick={() => handleMoveTask(t.id, colStatus === 'done' ? 'in_progress' : 'todo')}
                                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-accent/40"
                              >
                                ← Move Left
                              </button>
                            )}
                            {colStatus !== 'done' && (
                              <button
                                onClick={() => handleMoveTask(t.id, colStatus === 'todo' ? 'in_progress' : 'done')}
                                className="text-[10px] font-semibold text-primary hover:underline px-2 py-0.5 rounded bg-primary/10"
                              >
                                Move Right →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: INTERACTIVE TERMINAL */}
        {/* ==================================================== */}
        {activeTab === 'terminal' && (
          <div className="flex flex-col w-full h-full bg-slate-950 font-mono text-xs text-emerald-400">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 bg-slate-900/60">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                <TerminalIcon className="h-3.5 w-3.5 text-cyan-400" /> {projectName} Terminal Session
              </span>
              <button
                onClick={() => setTerminalHistory([])}
                className="text-[11px] text-slate-400 hover:text-red-400 transition-colors font-semibold"
              >
                Clear Terminal
              </button>
            </div>

            {/* Terminal History Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 leading-relaxed">
              {terminalHistory.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <span className="text-slate-500">[{item.time}]</span>
                    <span className="text-purple-400 font-bold">marketforge@workspace:~$</span>
                    <span className="text-white font-bold">{item.command}</span>
                  </div>
                  <div className="pl-4 space-y-0.5 text-slate-300">
                    {item.output.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Command Input Bar */}
            <form onSubmit={handleRunTerminalCommand} className="border-t border-slate-800 p-3 flex items-center gap-2 bg-slate-900/40">
              <ChevronRight className="h-4 w-4 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Type terminal command (e.g. npm test, python main.py, marketforge build)..."
                className="flex-1 bg-transparent text-xs text-white focus:outline-none font-mono"
              />
              <button type="submit" className="rounded bg-cyan-600 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-500">
                Run
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
