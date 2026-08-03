// ============================================
// DevForge AI — AI Workspace & Code Viewer
// ============================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  FileCode,
  Terminal,
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
} from 'lucide-react';
import { ROUTES, AGENT_CONFIG } from '@/lib/constants';
import { useProject, useUpdateProject } from '@/hooks/use-projects';
import {
  getProjectAgentStatuses,
  getDisabledAgentsForProject,
  toggleAgentForProject,
} from '@/lib/agent-lifecycle';
import type { AgentType } from '@/types';

export default function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id || '');
  const updateProject = useUpdateProject();

  const [disabledAgents, setDisabledAgents] = useState<AgentType[]>([]);

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
  };

  const dynamicFiles = [
    {
      path: 'backend/app/main.py',
      language: 'python',
      agent: 'backend_dev',
      content: `from fastapi import FastAPI
from app.api.v1 import router

app = FastAPI(title="${projectName} API", version="1.0.0")
app.include_router(router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok", "app": "${projectName}"}
`,
    },
    {
      path: `backend/app/models/${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.py`,
      language: 'python',
      agent: 'backend_dev',
      content: `from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime
from app.db import Base

class ${projectName.replace(/[^a-zA-Z0-9]/g, '')}Model(Base):
    __tablename__ = "${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
`,
    },
    {
      path: 'frontend/src/App.tsx',
      language: 'typescript',
      agent: 'frontend_dev',
      content: `import React, { useState } from 'react';

export default function App() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">${projectName}</h1>
      <p className="text-gray-500 mt-2">Built autonomously with DevForge AI Multi-Agent Platform.</p>
    </div>
  );
}
`,
    },
    {
      path: 'docker-compose.yml',
      language: 'yaml',
      agent: 'devops',
      content: `version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
`,
    },
  ];

  const mockLogs = [
    { id: '1', time: '10:00:01', level: 'info', agent: 'Product Manager', message: `Analyzing project scope & generating PRD for ${projectName}...` },
    { id: '2', time: '10:00:05', level: 'info', agent: 'Architect', message: `Designing database schema & API endpoints for ${projectName}...` },
    { id: '3', time: '10:00:12', level: 'info', agent: 'Planner', message: 'Created 6 task execution items in sprint plan.' },
    { id: '4', time: '10:00:20', level: 'info', agent: 'Backend Developer', message: 'Generated FastAPI endpoints and SQLAlchemy models.' },
    { id: '5', time: '10:00:35', level: 'info', agent: 'Frontend Developer', message: 'Generated React components & Vite configuration.' },
    { id: '6', time: '10:00:48', level: 'info', agent: 'QA Engineer', message: '48/48 unit tests passing (92.5% coverage).' },
    { id: '7', time: '10:01:00', level: 'info', agent: 'Security Analyst', message: 'OWASP scan completed: 0 vulnerabilities found.' },
  ];

  const [activeTab, setActiveTab] = useState<'code' | 'agents' | 'chat' | 'logs' | 'architecture' | 'tasks' | 'terminal'>('code');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const selectedFile = dynamicFiles[selectedFileIndex] || dynamicFiles[0];

  const [chatMessages, setChatMessages] = useState([
    { sender: 'Product Manager', text: `Hello! I have created the PRD and requirements for ${projectName}.` },
    { sender: 'Architect', text: 'The system architecture diagram is ready under the Architecture tab.' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages((prev) => [...prev, { sender: 'You', text: inputMsg }]);
    const currentInput = inputMsg;
    setInputMsg('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'Architect', text: `Got it! Updating specifications for "${currentInput}".` },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.PROJECTS} className="rounded-lg p-2 hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{projectName} Workspace</h1>
            <p className="text-xs text-muted-foreground">
              Project ID: {id} · Tech Stack: {projectTech} ({projectLang})
              {disabledAgents.length > 0 && (
                <span className="ml-2 font-medium text-amber-400">
                  · ({disabledAgents.length} Agent{disabledAgents.length > 1 ? 's' : ''} Disabled)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 rounded-xl bg-accent/40 p-1 border border-border/40">
          {[
            { id: 'code', label: 'Code', icon: FileCode },
            { id: 'agents', label: 'Agents Team', icon: Users },
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'logs', label: 'Logs', icon: ListFilter },
            { id: 'architecture', label: 'Architecture', icon: Network },
            { id: 'tasks', label: 'Tasks', icon: Kanban },
            { id: 'terminal', label: 'Terminal', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
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

      {/* Main Workspace Area */}
      <div className="flex-1 min-h-0 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex">
        {/* TAB 1: CODE VIEWER */}
        {activeTab === 'code' && (
          <div className="flex w-full h-full">
            {/* File Tree */}
            <div className="w-64 border-r border-border/50 bg-background/40 p-3 overflow-y-auto shrink-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Project Files</p>
              <div className="space-y-1">
                {dynamicFiles.map((file, idx) => {
                  const isSelected = selectedFileIndex === idx;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFileIndex(idx)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-mono text-left transition-colors ${
                        isSelected ? 'bg-primary/15 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <FileCode className="h-4 w-4 shrink-0" />
                      <span className="truncate">{file.path}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 bg-slate-900/50">
                <span className="text-xs font-mono text-slate-300">{selectedFile.path}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="flex-1 p-4 font-mono text-xs text-slate-200 overflow-auto leading-relaxed">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: AGENTS TEAM & ENABLE/DISABLE CONTROLS */}
        {activeTab === 'agents' && (
          <div className="p-6 w-full overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h2 className="text-lg font-bold">AI Agent Team Controls — {projectName}</h2>
                <p className="text-xs text-muted-foreground">
                  Enable or disable specific AI agents for this project dynamically at any time.
                </p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
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
                          ? 'border-primary/40 bg-primary/5'
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
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
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

        {/* TAB 3: CHAT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col w-full h-full">
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-muted-foreground mb-1">{msg.sender}</span>
                  <div className={`rounded-xl px-3.5 py-2 text-xs max-w-md ${
                    msg.sender === 'You' ? 'bg-primary text-primary-foreground' : 'bg-accent/60 text-foreground'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="border-t border-border/50 p-3 flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Instruct the AI agents (e.g. Add JWT authentication)..."
                className="flex-1 rounded-xl border border-border/50 bg-background px-3.5 py-2 text-xs focus:outline-none focus:border-primary"
              />
              <button type="submit" className="rounded-xl bg-primary px-3.5 py-2 text-primary-foreground">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: LOGS */}
        {activeTab === 'logs' && (
          <div className="p-4 w-full overflow-y-auto font-mono text-xs space-y-2">
            {mockLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 py-1 border-b border-border/20">
                <span className="text-muted-foreground text-[10px]">{log.time}</span>
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[10px]">{log.agent}</span>
                <span className="text-foreground">{log.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="p-6 w-full overflow-y-auto space-y-4">
            <h2 className="text-lg font-bold">System Architecture — {projectName}</h2>
            <div className="rounded-xl border border-border/50 p-4 bg-slate-950 font-mono text-xs text-cyan-400">
              <p className="text-slate-500 mb-2">// Architecture ER Diagram</p>
              <pre>{`graph TD;
  UI[React 19 Frontend (${projectName})] --> API[FastAPI Backend];
  API --> DB[(SQLite Database)];
  API --> AI[DevForge Multi-Agent Team];`}</pre>
            </div>
          </div>
        )}

        {/* TAB 6: TASKS */}
        {activeTab === 'tasks' && (
          <div className="p-6 w-full overflow-y-auto space-y-4">
            <h2 className="text-lg font-bold">Sprint Task Kanban — {projectName}</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: 'Requirements & PRD', status: 'Completed', agent: 'Product Manager' },
                { title: 'Architecture Diagram', status: 'Completed', agent: 'Architect' },
                { title: 'Backend API Implementation', status: 'In Progress', agent: 'Backend Dev' },
                { title: 'Frontend UI Components', status: 'In Progress', agent: 'Frontend Dev' },
                { title: 'Security Audit & OWASP Scan', status: 'Pending', agent: 'Security Analyst' },
                { title: 'Docker Setup & Deployment', status: 'Pending', agent: 'DevOps' },
              ].map((t) => (
                <div key={t.title} className="rounded-xl border border-border/50 p-4 bg-card/60 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">{t.status}</span>
                  <p className="font-semibold text-xs">{t.title}</p>
                  <p className="text-xs text-muted-foreground">Assignee: {t.agent}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="w-full h-full p-4 bg-slate-950 font-mono text-xs text-emerald-400 overflow-y-auto leading-relaxed">
            <p className="text-slate-500">$ devforge build --project "{projectName}"</p>
            <p>[+] Building project {id}</p>
            <p> ✔ Agent Product Manager: PRD generated</p>
            <p> ✔ Agent Architect: Schema & API specification compiled</p>
            <p> ✔ Agent Backend Developer: Endpoints generated</p>
            <p> ✔ Agent Frontend Developer: UI components generated</p>
            <p className="text-purple-400 mt-2">INFO: Application build complete for {projectName}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
