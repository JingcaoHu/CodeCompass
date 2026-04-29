from pydantic import BaseModel
from typing import List, Optional, Literal


class AnalyzeRepoRequest(BaseModel):
    repo_url: str


class AgentRequest(BaseModel):
    repo_url: str
    user_request: str


class FileNode(BaseModel):
    name: str
    type: Literal["file", "folder"]
    path: Optional[str] = None
    language: Optional[str] = None
    summary: Optional[str] = None
    children: Optional[List["FileNode"]] = None


class FileSummary(BaseModel):
    filePath: str
    summary: str


class Issue(BaseModel):
    title: str
    severity: Literal["Low", "Medium", "High"]
    description: str


class AgentStep(BaseModel):
    title: str
    description: str
    status: Literal["done", "active", "pending"]


class AnalyzeRepoResponse(BaseModel):
    project_name: str
    repo_url: str
    summary: str
    file_tree: List[FileNode]
    file_summaries: List[FileSummary]
    issues: List[Issue]
    repo_diagram: str
    agent_steps: List[AgentStep]


class AgentResponse(BaseModel):
    workflow_summary: str
    workflow_diagram: str
    agent_steps: List[AgentStep]
    final_answer: str


FileNode.model_rebuild()
