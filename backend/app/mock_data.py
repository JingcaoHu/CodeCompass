mock_file_tree = [
    {
        "name": "frontend",
        "type": "folder",
        "path": "frontend",
        "children": [
            {
                "name": "src",
                "type": "folder",
                "path": "frontend/src",
                "children": [
                    {
                        "name": "App.tsx",
                        "type": "file",
                        "path": "frontend/src/App.tsx",
                        "language": "TypeScript React",
                        "summary": "Main React component that controls the dashboard layout.",
                    },
                    {
                        "name": "main.tsx",
                        "type": "file",
                        "path": "frontend/src/main.tsx",
                        "language": "TypeScript",
                        "summary": "Entry point that mounts the React app.",
                    },
                ],
            },
            {
                "name": "package.json",
                "type": "file",
                "path": "frontend/package.json",
                "language": "JSON",
                "summary": "Stores frontend dependencies and scripts.",
            },
        ],
    },
    {
        "name": "backend",
        "type": "folder",
        "path": "backend",
        "children": [
            {
                "name": "app",
                "type": "folder",
                "path": "backend/app",
                "children": [
                    {
                        "name": "main.py",
                        "type": "file",
                        "path": "backend/app/main.py",
                        "language": "Python",
                        "summary": "FastAPI backend entry point.",
                    },
                    {
                        "name": "workflow.py",
                        "type": "file",
                        "path": "backend/app/graph/workflow.py",
                        "language": "Python",
                        "summary": "Defines the LangGraph workflow.",
                    },
                ],
            }
        ],
    },
]

mock_file_summaries = [
    {
        "filePath": "frontend/src/App.tsx",
        "summary": "Controls frontend state, dashboard rendering, and API calls.",
    },
    {
        "filePath": "backend/app/main.py",
        "summary": "Defines FastAPI routes for repo analysis and agent workflow generation.",
    },
    {
        "filePath": "backend/app/graph/workflow.py",
        "summary": "Defines the LangGraph workflow nodes and execution process.",
    },
]

mock_issues = [
    {
        "title": "Mock backend only",
        "severity": "Medium",
        "description": "This backend currently returns mock data. Real GitHub scanning will be added next.",
    },
    {
        "title": "API key security",
        "severity": "High",
        "description": "The OpenAI API key should stay in the backend .env file, not the frontend.",
    },
]

mock_agent_steps = [
    {
        "title": "Input Router",
        "description": "Receives the GitHub repository URL and starts the workflow.",
        "status": "done",
    },
    {
        "title": "Repo Scanner",
        "description": "Scans files, folders, and project metadata.",
        "status": "done",
    },
    {
        "title": "Summary Agent",
        "description": "Creates summaries for important files.",
        "status": "active",
    },
    {
        "title": "Supervisor Agent",
        "description": "Reviews intermediate outputs before final response.",
        "status": "pending",
    },
]

repo_diagram = """
graph TD
  A[User enters GitHub URL] --> B[React Frontend]
  B --> C[FastAPI Backend]
  C --> D[LangGraph Workflow]
  D --> E[Repo Scanner]
  D --> F[Summary Agent]
  D --> G[Supervisor Agent]
  G --> H[Final Dashboard Output]
"""

workflow_diagram = """
graph TD
  A[User Request] --> B[Supervisor Agent]
  B --> C[Repo Search Agent]
  C --> D[Human Review Step]
  D --> E[Code Context Collector]
  E --> F[Final AI Response]
"""