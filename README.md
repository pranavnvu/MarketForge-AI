# 🚀 DevForge AI

### Autonomous Multi-Agent Software Engineering Platform

DevForge AI is a production-grade SaaS platform where multiple AI agents collaborate like a real software company. Describe your software idea, and our AI engineering team handles the entire development lifecycle — from requirements to deployment.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        DevForge AI                               │
├─────────────────────────┬────────────────────────────────────────┤
│    Frontend (React)     │         Backend (FastAPI)              │
│    Vite + TypeScript    │         Python 3.11+                   │
│    Tailwind CSS         │         LangGraph + LangChain          │
│    shadcn/ui            │         SQLAlchemy + Alembic           │
│    React Router v6      │         Celery + Redis                 │
│    React Query          │         JWT + OAuth                    │
│    Zustand              │                                        │
│    Framer Motion        │    AI Agents (10 Specialists)          │
│                         │    ├── Product Manager                 │
│    Port: 3000           │    ├── Architect                       │
│                         │    ├── Planner                         │
├─────────────────────────┤    ├── Backend Developer               │
│       Databases         │    ├── Frontend Developer              │
│                         │    ├── QA Engineer                     │
│  PostgreSQL   (5432)    │    ├── Security Analyst                │
│  Redis        (6379)    │    ├── Code Reviewer                   │
│  Qdrant       (6333)    │    ├── Documentation Writer            │
│                         │    └── DevOps Engineer                 │
├─────────────────────────┤                                        │
│    Infrastructure       │    Port: 8000                          │
│                         │    WebSocket: 8000/ws                  │
│  Docker Compose         │                                        │
│  Nginx       (80/443)   │    Celery Worker                      │
│  Prometheus  (9090)     │    Celery Beat                        │
│  Grafana     (3001)     │    Flower (5555)                      │
└─────────────────────────┴────────────────────────────────────────┘
```

---

## ⚡ Quick Start

### Prerequisites

- **Docker** & **Docker Compose** (v2.0+)
- **Node.js** (v20+) & **npm**
- **Python** (3.11+) & **pip**
- **Git**

### 1. Clone & Setup

```bash
git clone https://github.com/your-username/devforge-ai.git
cd devforge-ai

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
nano .env
```

### 2. Start with Docker (Recommended)

```bash
# Build and start all services
make dev

# Or manually:
docker-compose up -d
```

### 3. Start for Local Development

```bash
# Start infrastructure (DB, Redis, Qdrant)
make dev-services

# In terminal 1: Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# In terminal 2: Frontend
cd frontend
npm install
npm run dev

# In terminal 3: Celery worker
cd backend
celery -A app.worker worker -Q default,agent_queue --loglevel=info
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000/docs |
| **Flower** | http://localhost:5555 |
| **Grafana** | http://localhost:3001 |
| **Prometheus** | http://localhost:9090 |

---

## 📁 Project Structure

```
devforge-ai/
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── features/       # Feature modules
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities & API client
│   │   ├── pages/          # Page components
│   │   ├── providers/      # React context providers
│   │   ├── router/         # React Router config
│   │   ├── stores/         # Zustand state stores
│   │   └── types/          # TypeScript interfaces
│   └── Dockerfile
│
├── backend/                # FastAPI + Python
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── agents/         # AI agent definitions
│   │   ├── core/           # Config, security, DB
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── tasks/          # Celery tasks
│   ├── alembic/            # Database migrations
│   ├── tests/              # Test suite
│   └── Dockerfile
│
├── infrastructure/         # DevOps configs
│   ├── docker/             # Nginx, SSL
│   └── monitoring/         # Prometheus, Grafana
│
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml      # Full stack orchestration
├── Makefile                # Dev commands
└── .env.example            # Environment template
```

---

## 🛠️ Available Commands

```bash
make help              # Show all commands
make dev               # Start all services
make dev-services      # Start DB, Redis, Qdrant only
make dev-backend       # Run backend locally
make dev-frontend      # Run frontend locally
make test              # Run all tests
make lint              # Run linters
make migrate           # Run DB migrations
make logs              # View service logs
make clean             # Remove all containers & volumes
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | Yes (or Anthropic) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Yes (or OpenAI) |
| `JWT_SECRET_KEY` | Secret for JWT tokens | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For Google login |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | For GitHub login |
| `SMTP_HOST` | Email server host | For email features |

---

## 🤖 AI Agents

| Agent | Role | Responsibilities |
|-------|------|-----------------|
| **Product Manager** | Requirements | User stories, acceptance criteria |
| **Architect** | System Design | APIs, database schema, tech stack |
| **Planner** | Task Management | Sprint planning, dependency graph |
| **Backend Dev** | Backend Code | APIs, models, business logic |
| **Frontend Dev** | Frontend Code | Components, pages, styling |
| **QA Engineer** | Testing | Unit tests, integration tests |
| **Security Analyst** | Security | Vulnerability scan, OWASP checks |
| **Code Reviewer** | Quality | Code review, best practices |
| **Documentation** | Docs | README, API docs, guides |
| **DevOps** | Infrastructure | Docker, CI/CD, deployment |

---

## 📝 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ by DevForge AI Team
