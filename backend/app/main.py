import re
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.services.github_service import (
    clone_github_repo,
    cleanup_repo,
    get_project_name,
)
from app.services.repo_scanner import scan_repo, flatten_files
from app.services.file_reader import read_important_files
from app.graph.workflow import (
    run_repo_workflow,
    run_agent_request_workflow,
    start_real_human_review_workflow,
    resume_real_human_review_workflow,
)
from app.services.repo_context_store import save_repo_context, get_repo_context
from app.models import (
    AnalyzeRepoRequest,
    AnalyzeRepoResponse,
    AgentRequest,
    AgentResponse,
    ReviewDecisionRequest,
)

load_dotenv()

app = FastAPI(
    title="CodeCompass API",
    description="FastAPI backend for GitHub repo analysis with LangGraph.",
    version="0.5.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def validate_github_url(repo_url: str):
    pattern = r"^https://github\.com/[^/\s]+/[^/\s]+/?$"

    if not re.match(pattern, repo_url.strip()):
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub repository URL. Use format: https://github.com/user/repo",
        )


@app.get("/")
def root():
    return {
        "message": "CodeCompass backend is running",
        "version": "0.5.0",
        "docs": "http://localhost:8000/docs",
    }


@app.post("/analyze-repo", response_model=AnalyzeRepoResponse)
def analyze_repo(
    request: AnalyzeRepoRequest,
    x_openai_api_key: str | None = Header(default=None),
):
    repo_path = None

    try:
        validate_github_url(request.repo_url)

        project_name = get_project_name(request.repo_url)
        repo_path = clone_github_repo(request.repo_url)

        scan_result = scan_repo(repo_path)
        file_tree = scan_result["file_tree"]
        file_count = len(flatten_files(file_tree))

        if file_count == 0:
            raise HTTPException(
                status_code=400,
                detail="No supported source files were found in this repository.",
            )

        important_files = read_important_files(repo_path)

        workflow_result = run_repo_workflow(
            repo_url=request.repo_url,
            project_name=project_name,
            file_count=file_count,
            important_files=important_files,
            api_key=x_openai_api_key,
        )
        save_repo_context(request.repo_url, important_files)

        return {
            "project_name": project_name,
            "repo_url": request.repo_url,
            "summary": workflow_result["summary"],
            "file_tree": file_tree,
            "file_summaries": workflow_result["file_summaries"],
            "issues": workflow_result["issues"],
            "repo_diagram": workflow_result["repo_diagram"],
            "agent_steps": workflow_result["steps"],
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Repository analysis failed. Reason: {str(error)}",
        )

    finally:
        if repo_path is not None:
            cleanup_repo(repo_path)


@app.post("/agent-request", response_model=AgentResponse)
def agent_request(
    request: AgentRequest,
    x_openai_api_key: str | None = Header(default=None),
):
    try:
        validate_github_url(request.repo_url)

        if not request.user_request.strip():
            raise HTTPException(
                status_code=400,
                detail="User request cannot be empty.",
            )

        important_files = get_repo_context(request.repo_url)

        if not important_files:
            repo_path = None
            try:
                repo_path = clone_github_repo(request.repo_url)
                important_files = read_important_files(repo_path)
            finally:
                if repo_path is not None:
                    cleanup_repo(repo_path)

        request_text = request.user_request.lower()

        if (
            "human" in request_text
            or "manual" in request_text
            or "review" in request_text
        ):
            return start_real_human_review_workflow(
                repo_url=request.repo_url,
                user_request=request.user_request,
                important_files=important_files,
                api_key=x_openai_api_key,
            )

        result = run_agent_request_workflow(
            repo_url=request.repo_url,
            user_request=request.user_request,
            important_files=important_files,
            api_key=x_openai_api_key,
        )

        return {
            "workflow_summary": result["workflow_summary"],
            "workflow_diagram": result["workflow_diagram"],
            "agent_steps": result["agent_steps"],
            "route": result["route"],
            "final_answer": result["final_answer"],
            "pending_review": False,
            "review_id": None,
            "review_payload": None,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Workflow generation failed. Reason: {str(error)}",
        )

@app.post("/resume-review", response_model=AgentResponse)
def resume_review(
    request: ReviewDecisionRequest,
):
    try:
        decision_payload = {
            "decision": request.decision,
            "edited_instruction": request.edited_instruction,
            "feedback": request.feedback,
        }

        return resume_real_human_review_workflow(
            review_id=request.review_id,
            decision=decision_payload,
        )

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to resume human review workflow. Reason: {str(error)}",
        )
