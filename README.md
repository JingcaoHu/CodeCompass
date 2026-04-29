# CodeCompass

CodeCompass is an AI-assisted GitHub repository analysis platform for beginner and intermediate developers. It combines a React frontend, a FastAPI backend, and LangGraph-based orchestration to inspect a public GitHub repository, summarize key files, identify issues, generate architecture diagrams, and route follow-up user requests through specialized AI workflow agents.

The project is designed to do more than return a single LLM response. It scans repository structure, selects important files, maintains lightweight repository context in memory, and dynamically routes user requests to different agents such as repository search, issue review, architecture explanation, and human-review planning.

## What CodeCompass Does

CodeCompass helps users:

- Understand an unfamiliar GitHub repository faster
- Generate a beginner-friendly summary of a codebase
- Inspect selected files through a structured file tree
- Review potential code issues and risks
- Visualize repository architecture with Mermaid diagrams
- Ask follow-up questions and trigger specialized AI workflows
- Explore supervised LangGraph-style agent execution instead of a single prompt-response interaction

## Core Features

### Repository Analysis

- Validates GitHub repository URLs before analysis begins
- Clones a public repository into a temporary backend workspace
- Scans the repository tree and filters unsupported or ignored files
- Limits supported file count, important file count, and per-file character usage
- Selects high-signal files such as `README.md`, `package.json`, `main.py`, `App.tsx`, and other likely entry points
- Uses OpenAI to generate:
  - Project summary
  - File summaries
  - Issue list with normalized severity values
  - Mermaid repository diagram

### LangGraph Workflow Routing

CodeCompass includes a request router and multiple specialized workflow agents:

- `Request Router`
- `Repo Search Agent`
- `Issue Review Agent`
- `Architecture Agent`
- `Human Review Agent`
- `General Fallback Agent`
- `Supervisor Agent`

The backend uses conditional edges to route requests dynamically based on user intent.

### Safer AI Output Handling

- Uses `gpt-5.4-mini` by default
- Retries OpenAI calls with exponential backoff
- Extracts JSON from imperfect model output
- Applies fallback analysis if AI output is malformed or incomplete
- Validates Mermaid output and replaces invalid diagrams with a safe fallback
- Preserves a cached repository context for follow-up agent requests

### Frontend Dashboard

- Repository input and validation
- API key input modal for local development
- Analysis status bar
- File tree browser
- Summary and issue panels
- Architecture diagram viewer
- Workflow timeline and workflow diagram display
- Final answer display for routed workflow requests

## Project Structure

```text
CodeCompass/
├── backend/
│   ├── app/
│   │   ├── graph/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── main.py
│   │   └── models.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── lib/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Mermaid

### Backend

- FastAPI
- Python
- LangGraph
- OpenAI Python SDK
- GitPython
- Tenacity

## How the System Works

### Analysis Flow

1. The user enters a public GitHub repository URL in the frontend.
2. The frontend sends the URL to `POST /analyze-repo`.
3. The backend validates the URL and clones the repository.
4. The backend scans the file tree and selects important files.
5. A LangGraph repository analysis workflow runs:
   - Input Router
   - Repo Scanner
   - AI Summary Agent
   - Supervisor Agent
6. The frontend renders:
   - Project summary
   - File tree
   - File summaries
   - Issues
   - Repository architecture diagram

### Follow-Up Workflow Flow

1. The user submits a follow-up request such as:
   - "Find where authentication is implemented"
   - "Review likely bugs in this repo"
   - "Explain the system architecture"
   - "Add a human review step"
2. The frontend sends the request to `POST /agent-request`.
3. The backend reads cached repository context or rebuilds it if needed.
4. The LangGraph router classifies the request.
5. A specialized agent executes.
6. The Supervisor Agent finishes the workflow.
7. The frontend displays:
   - Workflow summary
   - Workflow diagram
   - Agent timeline
   - Final answer

## Installation

## Prerequisites

- Node.js 18+ recommended
- npm
- Python 3.11+ recommended
- A valid OpenAI API key
- Internet access for cloning public GitHub repositories and calling the OpenAI API

## 1. Clone the Repository

```bash
git clone https://github.com/JingcaoHu/CNIT566FinalProject.git
cd CNIT566FinalProject
```

## 2. Set Up the Backend

Create a Python virtual environment and install dependencies:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4-mini
MAX_IMPORTANT_FILES=8
MAX_FILE_CHARS=6000
MAX_SUPPORTED_FILES=300
```

Notes:

- `OPENAI_API_KEY` is required unless you want to supply the API key from the frontend request header.
- `OPENAI_MODEL` defaults to `gpt-5.4-mini`.
- The other variables control backend scanning limits and prompt size.

Start the backend server:

```bash
uvicorn app.main:app --reload
```

By default, the backend runs at:

```text
http://localhost:8000
```

FastAPI docs are available at:

```text
http://localhost:8000/docs
```

## 3. Set Up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

By default, the frontend runs at:

```text
http://localhost:5173
```

Optional: if your backend is not running on port `8000`, set:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## User Guide

## Step 1. Open the Web App

Open the local frontend URL in your browser:

```text
http://localhost:5173
```

## Step 2. Add an API Key

Use the settings/API key modal in the UI.

Current behavior:

- The frontend can store the key in browser storage for local use
- The frontend sends the key to the backend using a request header
- For production systems, the key should be stored server-side instead

## Step 3. Analyze a Repository

Paste a public GitHub repository URL such as:

```text
https://github.com/user/repository
```

Then click `Analyze Repo`.

Expected output:

- A project summary
- Important file summaries
- A detected issue list
- A repository architecture diagram
- A file tree for exploration
- Analysis workflow steps

## Step 4. Review the Dashboard

After analysis, use the tabs and dashboard sections to inspect:

- Overview
- Files
- Workflow
- Issues

## Step 5. Generate a Specialized Workflow

Open the workflow request area and submit a question or task.

Examples:

- `Find where authentication is implemented`
- `Review likely validation bugs in this codebase`
- `Explain the architecture of this project`
- `Add a human review step before the final response`
- `Where is the main API entry point?`

The system will route the request to the most appropriate specialized agent.

## API Reference

## `POST /analyze-repo`

Request body:

```json
{
  "repo_url": "https://github.com/user/repository"
}
```

Optional header:

```text
x-openai-api-key: your_api_key
```

Response includes:

- `project_name`
- `repo_url`
- `summary`
- `file_tree`
- `file_summaries`
- `issues`
- `repo_diagram`
- `agent_steps`

## `POST /agent-request`

Request body:

```json
{
  "repo_url": "https://github.com/user/repository",
  "user_request": "Explain the project architecture"
}
```

Optional header:

```text
x-openai-api-key: your_api_key
```

Response includes:

- `workflow_summary`
- `workflow_diagram`
- `agent_steps`
- `final_answer`

## Current Safeguards and Limits

The backend includes several controls to improve reliability:

- GitHub URL validation
- Supported file count limit
- Important file selection limit
- Per-file content character limit
- Large-file filtering
- OpenAI retry behavior
- JSON extraction from model output
- Fallback workflow and analysis results
- Severity normalization for issue output
- Mermaid validation fallback

These safeguards make the project more stable for classroom demos and MVP-style developer tooling.

## Recommended Use Cases

CodeCompass can be used for:

- Learning a new open-source project
- Demoing LangGraph-style orchestration
- Teaching codebase reading and software architecture basics
- Building an AI code companion for class projects
- Creating repository onboarding tools for junior developers
- Generating guided repo walkthroughs before manual review

## Practical Improvement Ideas

If you want to continue growing this project, these are strong next steps:

- Add persistent storage instead of in-memory repo context
- Support private repositories with GitHub tokens
- Add user authentication and project history
- Store previous analyses for later comparison
- Improve routing with model-based classification instead of keyword rules
- Add streaming responses for long-running analyses
- Add test coverage for route selection and fallback behavior
- Add production-safe backend key management
- Add richer file filtering by language or framework
- Add a download/export feature for reports

## Best Practices for Users

- Start with a small or medium public repository for the best first experience
- Use clear task prompts such as `find`, `review`, `explain`, or `architecture`
- Treat AI output as guided assistance, not as a guaranteed source of truth
- Always manually review security-sensitive or architecture-critical conclusions
- Use the human review path when you want a supervised approval checkpoint

## Troubleshooting

## The frontend says the backend is unavailable

Check that:

- The FastAPI server is running
- The backend is available on `http://localhost:8000`
- CORS is not blocked by a different frontend origin

## Repository analysis fails

Possible causes:

- Invalid GitHub URL
- Repository is private or unavailable
- No supported source files were detected
- OpenAI API key is missing or invalid
- Network issues during clone or model call

## Workflow generation fails

Check that:

- You analyzed the repository first, or the backend can clone it successfully
- The request is not empty
- The API key is valid

## Mermaid diagram looks generic

This can happen when:

- The AI output did not produce valid Mermaid
- The backend replaced it with a fallback diagram for safety

## Development Notes

- The root repository is organized as a monorepo with `frontend/` and `backend/`
- The frontend contains its own build tooling and source tree
- The backend currently stores repository context in memory for follow-up requests
- The app is optimized for local development and demonstration use rather than production deployment

## License

This project currently does not define a license file in the repository. If you plan to share or deploy it publicly, add a license that matches your intended use.
