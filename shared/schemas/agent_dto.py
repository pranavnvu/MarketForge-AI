from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


# ====================================================
# 1. PROJECT MANAGER AGENT DTOs (POST /plan)
# ====================================================
class ProjectPlanRequest(BaseModel):
    idea: str = Field(..., description="User project idea or software requirements prompt")


class TaskItemDTO(BaseModel):
    id: str
    title: str
    description: str
    assigned_to: str
    dependencies: List[str] = []


class ProjectPlanResponse(BaseModel):
    project_name: str
    summary: str
    tech_stack: List[str]
    tasks: List[TaskItemDTO]
    milestones: List[str]
    dependencies: List[str]


# ====================================================
# 2. DATABASE AGENT DTOs (POST /database)
# ====================================================
class DatabaseSchemaRequest(BaseModel):
    requirements: Dict[str, Any] = Field(..., description="Project plan and requirements context")


class TableColumnDTO(BaseModel):
    name: str
    type: str
    primary_key: bool = False
    nullable: bool = True


class TableSchemaDTO(BaseModel):
    name: str
    columns: List[TableColumnDTO]


class DatabaseSchemaResponse(BaseModel):
    project_name: str
    tables: List[TableSchemaDTO]
    sqlalchemy_code: str
    migrations_code: str


# ====================================================
# 3. BACKEND AGENT DTOs (POST /generate-backend)
# ====================================================
class BackendGenerateRequest(BaseModel):
    requirements: Dict[str, Any] = Field(..., description="Project plan & database context")


class APIRouteDTO(BaseModel):
    path: str
    method: str
    description: str


class BackendGenerateResponse(BaseModel):
    project_name: str
    routes: List[APIRouteDTO]
    crud_code: str
    main_code: str


# ====================================================
# 4. FRONTEND AGENT DTOs (POST /generate-ui)
# ====================================================
class UIGenerateRequest(BaseModel):
    requirements: Dict[str, Any] = Field(..., description="Project plan & API context")


class UIComponentDTO(BaseModel):
    name: str
    file_path: str
    description: str


class UIGenerateResponse(BaseModel):
    project_name: str
    components: List[UIComponentDTO]
    react_code: str


# ====================================================
# 5. QA & REVIEW AGENT DTOs (POST /review)
# ====================================================
class QAReviewRequest(BaseModel):
    code_context: Dict[str, Any] = Field(..., description="Generated backend, frontend & database code")


class QAReviewResponse(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Overall code quality score out of 100")
    bugs: List[str] = []
    security: List[str] = []
    performance: List[str] = []
    recommendations: List[str] = []


# ====================================================
# 6. DOCUMENTATION AGENT DTOs (POST /docs)
# ====================================================
class DocsGenerateRequest(BaseModel):
    requirements: Dict[str, Any] = Field(..., description="Complete project context")


class DocsGenerateResponse(BaseModel):
    readme: str
    installation_guide: str
    folder_structure: str
    api_docs: str
    deployment_guide: str
