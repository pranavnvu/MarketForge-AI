// ============================================
// DevForge AI — AI Workspace & Code Viewer
// ============================================

import { useState } from 'react';
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
  Download,
  Send,
  Check,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useProject } from '@/hooks/use-projects';

export default function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id || '');

  const projectName = project?.name || 'Project Workspace';
  const projectTech = project?.config?.techStack || 'fullstack';
  const projectLang = project?.config?.language || 'typescript';

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

  const [activeTab, setActiveTab] = useState<'chat' | 'logs' | 'code' | 'architecture' | 'tasks' | 'terminal'>('code');
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
            <p className="text-xs text-muted-foreground">Project ID: {id} · Tech Stack: {projectTech} ({projectLang})</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 rounded-xl bg-accent/40 p-1 border border-border/40">
          {[
            { id: 'code', label: 'Code', icon: FileCode },
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
                      <FileCode className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{file.path}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 bg-slate-900/60">
                <span className="font-mono text-xs text-slate-400">{selectedFile.path}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 transition-colors">
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed selection:bg-purple-500/30">
                <pre>{selectedFile.content}</pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AGENT CHAT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col w-full h-full">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.sender === 'You' ? 'justify-end' : ''}`}>
                  {msg.sender !== 'You' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 font-bold shrink-0">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-md rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === 'You'
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border/50 bg-accent/40 text-foreground'
                    }`}
                  >
                    <p className="font-semibold mb-1 opacity-70">{msg.sender}</p>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-border/50 flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ask agents to modify code, add features..."
                className="flex-1 rounded-xl border border-border/50 bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground flex items-center gap-2 shadow-md hover:opacity-90"
              >
                <Send className="h-3.5 w-3.5" /> Send
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: LOGS */}
        {activeTab === 'logs' && (
          <div className="flex flex-col w-full h-full p-4 font-mono text-xs bg-slate-950 text-slate-200 overflow-y-auto space-y-2">
            {mockLogs.map((log) => (
              <div key={log.id} className="flex gap-3 items-center border-b border-slate-900 pb-2">
                <span className="text-slate-500 whitespace-nowrap">{log.time}</span>
                <span className="rounded bg-purple-500/10 text-purple-400 px-2 py-0.5 font-bold whitespace-nowrap">{log.agent}</span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="p-6 w-full overflow-y-auto space-y-6">
            <h2 className="text-lg font-bold">System Architecture Specification — {projectName}</h2>
            <div className="rounded-xl border border-border/50 bg-accent/20 p-4 font-mono text-xs space-y-2">
              <p className="font-semibold text-primary">System Type: {projectTech} ({projectLang})</p>
              <p className="text-muted-foreground">Database: SQLite / PostgreSQL | Multi-Agent Execution Engine</p>
            </div>

            <div className="rounded-2xl border border-border/50 p-6 bg-slate-950 text-emerald-400 font-mono text-xs">
              <p className="text-slate-500 mb-2">// Architecture ER Diagram</p>
              <pre>{`graph TD;
  UI[React 19 Frontend (${projectName})] --> API[FastAPI Backend];
  API --> DB[(SQLite Database)];
  API --> AI[DevForge Multi-Agent Team];`}</pre>
            </div>
          </div>
        )}

        {/* TAB 5: TASKS */}
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

        {/* TAB 6: TERMINAL */}
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
