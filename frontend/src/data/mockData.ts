import type{
    AgentStep,
    FileNode,
    FileSummary,
    Issue,
    ProjectAnalysis,
    WorkflowResult,
  } from "../types";

export const mockFileTree: FileNode[] = [
  {
    name: "frontend",
    type: "folder",
    path: "frontend",
    children: [
      {
        name: "src",
        type: "folder",
        path: "frontend/src",
        children: [
          {
            name: "App.tsx",
            type: "file",
            path: "frontend/src/App.tsx",
            language: "TypeScript React",
            summary: "Main React component that controls the CodeCompass dashboard layout.",
          },
          {
            name: "main.tsx",
            type: "file",
            path: "frontend/src/main.tsx",
            language: "TypeScript",
            summary: "Entry point that mounts the React app into the browser DOM.",
          },
          {
            name: "components",
            type: "folder",
            path: "frontend/src/components",
            children: [
              {
                name: "FileTree.tsx",
                type: "file",
                path: "frontend/src/components/FileTree.tsx",
                language: "TypeScript React",
                summary: "Displays the repository structure as an expandable tree.",
              },
            ],
          },
        ],
      },
      {
        name: "package.json",
        type: "file",
        path: "frontend/package.json",
        language: "JSON",
        summary: "Stores frontend dependencies and development scripts.",
      },
    ],
  },
  {
    name: "backend",
    type: "folder",
    path: "backend",
    children: [
      {
        name: "app",
        type: "folder",
        path: "backend/app",
        children: [
          {
            name: "main.py",
            type: "file",
            path: "backend/app/main.py",
            language: "Python",
            summary: "FastAPI application entry point that exposes repo analysis endpoints.",
          },
          {
            name: "workflow.py",
            type: "file",
            path: "backend/app/workflow.py",
            language: "Python",
            summary: "Defines the LangGraph workflow for repo scanning, summarization, and supervision.",
          },
        ],
      },
      {
        name: "requirements.txt",
        type: "file",
        path: "backend/requirements.txt",
        language: "Text",
        summary: "Lists Python backend packages.",
      },
    ],
  },
  {
    name: "README.md",
    type: "file",
    path: "README.md",
    language: "Markdown",
    summary: "Explains the project goal, setup steps, and usage.",
  },
];

export const mockSummary =
  "This repository is a full-stack AI codebase analysis tool. The React frontend provides a polished dashboard where users can enter a GitHub repository, view file structure, read summaries, inspect diagrams, and request new supervised AI workflows. The backend will use FastAPI and LangGraph to scan repositories, summarize important files, generate architecture explanations, and coordinate specialized AI agents.";

export const mockFileSummaries: FileSummary[] = [
  {
    filePath: "frontend/src/App.tsx",
    summary: "Controls the main UI state, including repo analysis, error messages, API key modal, and dashboard visibility.",
  },
  {
    filePath: "frontend/src/components/FileTree.tsx",
    summary: "Renders the repository as an expandable tree and lets users select files for more details.",
  },
  {
    filePath: "backend/app/main.py",
    summary: "Will define FastAPI endpoints such as /analyze-repo and /agent-request.",
  },
  {
    filePath: "backend/app/workflow.py",
    summary: "Will define LangGraph nodes such as repo scanner, summary agent, diagram agent, supervisor agent, and output formatter.",
  },
];

export const mockIssues: Issue[] = [
  {
    title: "No backend connected yet",
    severity: "Medium",
    description: "The current frontend uses mock data. Backend integration will be added in the next project phase.",
  },
  {
    title: "API key should not be stored in frontend",
    severity: "High",
    description: "The API key modal is only a UI placeholder. The real OpenAI API key should be stored in a backend .env file.",
  },
  {
    title: "Large repository risk",
    severity: "Medium",
    description: "Large GitHub repositories may require file filtering, chunking, and token control.",
  },
];

export const agentSteps: AgentStep[] = [
  {
    title: "Input Router",
    description: "Receives the GitHub URL and decides which workflow should run.",
    status: "done",
  },
  {
    title: "Repo Scanner",
    description: "Scans folders, file paths, file types, and important project metadata.",
    status: "done",
  },
  {
    title: "File Filter Agent",
    description: "Removes node_modules, .git, build folders, cache files, and unsupported files.",
    status: "done",
  },
  {
    title: "Summary Agent",
    description: "Summarizes important source files and explains their purpose.",
    status: "active",
  },
  {
    title: "Supervisor Agent",
    description: "Reviews intermediate outputs before final results are shown to the user.",
    status: "pending",
  },
];

export const repoDiagram = `
graph TD
  A[User enters GitHub URL] --> B[React Frontend]
  B --> C[FastAPI Backend]
  C --> D[Repo Scanner]
  D --> E[LangGraph Workflow]
  E --> F[Summary Agent]
  E --> G[Diagram Agent]
  E --> H[Supervisor Agent]
  H --> I[Final Dashboard Output]
`;

export const workflowDiagram = `
graph TD
  A[User Request] --> B[Supervisor Agent]
  B --> C[Repo Search Agent]
  C --> D[Human Review Step]
  D --> E[Code Context Collector]
  E --> F[Final AI Response]
`;

export const mockProjectAnalysis: ProjectAnalysis = {
  projectName: "CodeCompass Demo Repo",
  repoUrl: "https://github.com/langchain-ai/langgraph",
  summary: mockSummary,
  fileTree: mockFileTree,
  fileSummaries: mockFileSummaries,
  issues: mockIssues,
  repoDiagram,
  agentSteps,
};

export const mockWorkflowResult: WorkflowResult = {
  workflowSummary:
    "LangGraph routed the request through a Supervisor Agent, selected a specialized Repo Search Agent, collected relevant code context, and prepared a final answer.",
  workflowDiagram,
  agentSteps,
  route: "repo_search",
  finalAnswer:
    "The Repo Search Agent reviewed the important files and found the most relevant code context for the user's request. In the real backend version, this answer is generated from actual repository files.",
};
