import json
import os
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from app.config import OPENAI_MODEL

def get_client(api_key: str | None = None):
    if api_key:
        return OpenAI(api_key=api_key)

    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def safe_json_loads(text: str):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}") + 1

        if start >= 0 and end > start:
            return json.loads(text[start:end])

        raise ValueError("AI response was not valid JSON.")


def normalize_issue_severity(issue: dict):
    severity = issue.get("severity", "Medium")

    if severity not in {"Low", "Medium", "High"}:
        severity = "Medium"

    issue["severity"] = severity
    return issue


def fallback_repo_analysis(project_name: str, repo_url: str, important_files: list):
    file_summaries = [
        {
            "filePath": item["path"],
            "summary": f"This is a {item['language']} file selected as important for repository analysis.",
        }
        for item in important_files
    ]

    return {
        "summary": (
            f"CodeCompass scanned {project_name} from {repo_url}. "
            "The AI analysis failed or returned invalid JSON, so this fallback summary was generated from file metadata."
        ),
        "file_summaries": file_summaries,
        "issues": [
            {
                "title": "AI analysis fallback used",
                "severity": "Medium",
                "description": "The AI response could not be parsed, so the backend returned a safe fallback result.",
            }
        ],
        "repo_diagram": f"""
graph TD
  A[GitHub Repo: {project_name}] --> B[Repo Scanner]
  B --> C[Important File Selection]
  C --> D[Fallback Summary]
  D --> E[React Dashboard]
""",
    }


def fallback_workflow(repo_url: str, user_request: str):
    return {
        "workflow_summary": (
            f"Fallback workflow generated for {repo_url}. "
            f"User request: {user_request}"
        ),
        "workflow_diagram": """
graph TD
  A[User Request] --> B[Supervisor Agent]
  B --> C[Repo Search Agent]
  C --> D[Human Review Step]
  D --> E[Final Response]
""",
        "agent_steps": [
            {
                "title": "Supervisor Agent",
                "description": "Reviews the user request and chooses the next step.",
                "status": "done",
            },
            {
                "title": "Repo Search Agent",
                "description": "Searches relevant files in the repository.",
                "status": "active",
            },
            {
                "title": "Final Response Agent",
                "description": "Creates the final answer after review.",
                "status": "pending",
            },
        ],
        "final_answer": (
            "CodeCompass generated a safe fallback workflow response because the AI result was unavailable."
        ),
    }


@retry(stop=stop_after_attempt(2), wait=wait_exponential(min=1, max=4))
def call_openai_json(prompt: str, api_key: str | None = None):
    response = get_client(api_key).responses.create(
        model=OPENAI_MODEL,
        input=prompt,
    )

    return safe_json_loads(response.output_text)


def validate_repo_result(result: dict, project_name: str, repo_url: str, important_files: list):
    if not isinstance(result, dict):
        return fallback_repo_analysis(project_name, repo_url, important_files)

    result.setdefault("summary", "")
    result.setdefault("file_summaries", [])
    result.setdefault("issues", [])
    result.setdefault("repo_diagram", "")

    if not result["summary"]:
        result["summary"] = fallback_repo_analysis(project_name, repo_url, important_files)["summary"]

    if not isinstance(result["file_summaries"], list):
        result["file_summaries"] = []

    if not result["file_summaries"]:
        result["file_summaries"] = fallback_repo_analysis(project_name, repo_url, important_files)["file_summaries"]

    if not isinstance(result["issues"], list):
        result["issues"] = []

    result["issues"] = [normalize_issue_severity(issue) for issue in result["issues"] if isinstance(issue, dict)]

    if not result["issues"]:
        result["issues"] = fallback_repo_analysis(project_name, repo_url, important_files)["issues"]

    if not result["repo_diagram"].strip().startswith("graph"):
        result["repo_diagram"] = fallback_repo_analysis(project_name, repo_url, important_files)["repo_diagram"]

    return result


def validate_workflow_result(result: dict, repo_url: str, user_request: str):
    fallback = fallback_workflow(repo_url, user_request)

    if not isinstance(result, dict):
        return fallback

    result.setdefault("workflow_summary", fallback["workflow_summary"])
    result.setdefault("workflow_diagram", fallback["workflow_diagram"])
    result.setdefault("agent_steps", fallback["agent_steps"])
    result.setdefault("final_answer", fallback["final_answer"])

    if not result["workflow_diagram"].strip().startswith("graph"):
        result["workflow_diagram"] = fallback["workflow_diagram"]

    if not isinstance(result["agent_steps"], list):
        result["agent_steps"] = fallback["agent_steps"]

    if not isinstance(result["final_answer"], str) or not result["final_answer"].strip():
        result["final_answer"] = fallback["final_answer"]

    return result


def generate_repo_analysis(
    project_name: str,
    repo_url: str,
    important_files: list,
    api_key: str | None = None,
):
    files_text = ""

    for item in important_files:
        files_text += f"\n\n--- FILE: {item['path']} ({item['language']}) ---\n"
        files_text += item["content"]

    prompt = f"""
You are CodeCompass, a senior software architect and code reviewer.

Analyze this GitHub repository for beginner developers.

Project name: {project_name}
Repo URL: {repo_url}

Important file contents:
{files_text}

Return ONLY valid JSON with this exact schema:
{{
  "summary": "A clear 1 paragraph project summary.",
  "file_summaries": [
    {{
      "filePath": "path/to/file",
      "summary": "simple explanation of what this file does"
    }}
  ],
  "issues": [
    {{
      "title": "issue title",
      "severity": "Low | Medium | High",
      "description": "short issue explanation"
    }}
  ],
  "repo_diagram": "Mermaid graph TD diagram text only"
}}

Rules:
- Do not invent files that are not shown.
- Keep explanations simple.
- The repo_diagram must be valid Mermaid graph TD syntax.
- Find 2 to 4 realistic issues or risks.
- Avoid markdown outside JSON.
"""

    try:
        result = call_openai_json(prompt, api_key=api_key)
        return validate_repo_result(result, project_name, repo_url, important_files)
    except Exception:
        return fallback_repo_analysis(project_name, repo_url, important_files)


def generate_workflow_from_request(
    repo_url: str,
    user_request: str,
    api_key: str | None = None,
):
    prompt = f"""
You are CodeCompass Workflow Builder.

The user is analyzing this GitHub repo:
{repo_url}

The user request is:
{user_request}

Create a supervised LangGraph-style AI workflow.

Return ONLY valid JSON with this exact schema:
{{
  "workflow_summary": "short explanation of the generated workflow",
  "workflow_diagram": "Mermaid graph TD diagram text only",
  "agent_steps": [
    {{
      "title": "step title",
      "description": "what this step does",
      "status": "done | active | pending"
    }}
  ]
}}

Rules:
- Include a Supervisor Agent.
- Include at least one specialized agent.
- If the user asks for human/manual review, include a Human Review Step.
- Mermaid must be graph TD syntax.
- Avoid markdown outside JSON.
"""

    try:
        result = call_openai_json(prompt, api_key=api_key)
        return validate_workflow_result(result, repo_url, user_request)
    except Exception:
        return fallback_workflow(repo_url, user_request)
