from typing import List, TypedDict
from langgraph.graph import END, StateGraph
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command, interrupt
import uuid
from app.services.ai_service import (
    call_openai_json,
    generate_repo_analysis,
    validate_workflow_result,
)


class RepoAnalysisState(TypedDict):
    repo_url: str
    project_name: str
    important_files: List[dict]
    api_key: str | None
    summary: str
    file_summaries: List[dict]
    issues: List[dict]
    repo_diagram: str
    steps: List[dict]
    file_count: int


class AgentRequestState(TypedDict):
    repo_url: str
    user_request: str
    important_files: List[dict]
    api_key: str | None
    route: str
    workflow_summary: str
    workflow_diagram: str
    agent_steps: List[dict]
    final_answer: str


def input_node(state: RepoAnalysisState) -> RepoAnalysisState:
    state["steps"].append(
        {
            "title": "Input Router",
            "description": "Received GitHub URL and initialized LangGraph state.",
            "status": "done",
        }
    )
    return state


def scanner_node(state: RepoAnalysisState) -> RepoAnalysisState:
    state["steps"].append(
        {
            "title": "Repo Scanner",
            "description": (
                f"Scanned repository structure and detected about {state['file_count']} supported files."
            ),
            "status": "done",
        }
    )
    return state


def ai_analysis_node(state: RepoAnalysisState) -> RepoAnalysisState:
    ai_result = generate_repo_analysis(
        project_name=state["project_name"],
        repo_url=state["repo_url"],
        important_files=state["important_files"],
        api_key=state["api_key"],
    )

    state["summary"] = ai_result.get("summary", "")
    state["file_summaries"] = ai_result.get("file_summaries", [])
    state["issues"] = ai_result.get("issues", [])
    state["repo_diagram"] = ai_result.get("repo_diagram", "")

    state["steps"].append(
        {
            "title": "AI Summary Agent",
            "description": "Read important files and generated repository analysis output.",
            "status": "done",
        }
    )

    return state


def analysis_supervisor_node(state: RepoAnalysisState) -> RepoAnalysisState:
    state["steps"].append(
        {
            "title": "Supervisor Agent",
            "description": "Reviewed the repository summary, issues, and diagram before returning output.",
            "status": "done",
        }
    )
    return state


def build_repo_workflow():
    graph = StateGraph(RepoAnalysisState)

    graph.add_node("input", input_node)
    graph.add_node("scanner", scanner_node)
    graph.add_node("ai_analysis", ai_analysis_node)
    graph.add_node("supervisor", analysis_supervisor_node)

    graph.set_entry_point("input")
    graph.add_edge("input", "scanner")
    graph.add_edge("scanner", "ai_analysis")
    graph.add_edge("ai_analysis", "supervisor")
    graph.add_edge("supervisor", END)

    return graph.compile()


def run_repo_workflow(
    repo_url: str,
    project_name: str,
    file_count: int,
    important_files: List[dict],
    api_key: str | None = None,
):
    workflow = build_repo_workflow()

    initial_state: RepoAnalysisState = {
        "repo_url": repo_url,
        "project_name": project_name,
        "important_files": important_files,
        "api_key": api_key,
        "summary": "",
        "file_summaries": [],
        "issues": [],
        "repo_diagram": "",
        "steps": [],
        "file_count": file_count,
    }

    return workflow.invoke(initial_state)


def request_router_node(state: AgentRequestState) -> AgentRequestState:
    request = state["user_request"].lower()

    if "human" in request or "manual" in request or "review" in request:
        state["route"] = "human_review"
    elif "search" in request or "find" in request or "where" in request:
        state["route"] = "repo_search"
    elif "issue" in request or "bug" in request or "problem" in request:
        state["route"] = "issue_review"
    elif "architecture" in request or "diagram" in request or "structure" in request:
        state["route"] = "architecture"
    else:
        state["route"] = "general"

    state["agent_steps"].append(
        {
            "title": "Request Router",
            "description": f"Classified the user request as: {state['route']}.",
            "status": "done",
        }
    )

    return state


def build_repo_context(important_files: List[dict], char_limit: int) -> str:
    sections = []

    for file in important_files:
        content = file.get("content", "")[:char_limit]
        sections.append(f"FILE: {file['path']}\n{content}")

    return "\n\n".join(sections)


def run_specialized_agent(
    state: AgentRequestState,
    *,
    role: str,
    instructions: str,
    fallback_summary: str,
):
    prompt = f"""
You are {role}.

User request:
{state["user_request"]}

Repository context:
{build_repo_context(state["important_files"], 2000)}

Instructions:
{instructions}

Return ONLY valid JSON:
{{
  "final_answer": "helpful answer grounded in the repository context",
  "workflow_summary": "explain what this specialized agent did",
  "workflow_diagram": "Mermaid graph TD diagram"
}}
"""

    try:
        result = call_openai_json(prompt, api_key=state["api_key"])
    except Exception:
        result = {}

    validated = validate_workflow_result(result, state["repo_url"], state["user_request"])
    state["final_answer"] = validated.get(
        "final_answer",
        f"{fallback_summary} No specific final answer was available, so CodeCompass returned a safe fallback.",
    )
    state["workflow_summary"] = validated.get("workflow_summary", fallback_summary)
    state["workflow_diagram"] = validated.get("workflow_diagram", "")

    return state


def repo_search_agent_node(state: AgentRequestState) -> AgentRequestState:
    state = run_specialized_agent(
        state,
        role="a Repo Search Agent",
        instructions="Answer the request using only the available repository context.",
        fallback_summary="The repo search agent inspected important files for relevant code paths.",
    )

    state["agent_steps"].append(
        {
            "title": "Repo Search Agent",
            "description": "Searched important repository files for relevant code context.",
            "status": "done",
        }
    )

    return state


def human_review_agent_node(state: AgentRequestState) -> AgentRequestState:
    state["workflow_summary"] = (
        "The workflow was updated to include a Human Review Step before the final answer."
    )
    state["workflow_diagram"] = """
graph TD
  A[User Request] --> B[Request Router]
  B --> C[Repo Search Agent]
  C --> D[Human Review Step]
  D --> E[Supervisor Agent]
  E --> F[Final Answer]
"""
    state["final_answer"] = (
        "A human review checkpoint has been inserted. Review the retrieved repository context "
        "before accepting the final answer."
    )
    state["agent_steps"].append(
        {
            "title": "Human Review Agent",
            "description": "Inserted a manual review checkpoint into the supervised workflow.",
            "status": "done",
        }
    )

    return state


def issue_review_agent_node(state: AgentRequestState) -> AgentRequestState:
    state = run_specialized_agent(
        state,
        role="a Code Issue Review Agent",
        instructions="Find bugs, risky validation gaps, design smells, and failure cases.",
        fallback_summary="The issue review agent checked the repository context for bugs and design risks.",
    )

    state["agent_steps"].append(
        {
            "title": "Issue Review Agent",
            "description": "Reviewed repository context for possible bugs, validation issues, and design risks.",
            "status": "done",
        }
    )

    return state


def architecture_agent_node(state: AgentRequestState) -> AgentRequestState:
    state = run_specialized_agent(
        state,
        role="a Software Architecture Agent",
        instructions="Explain the repository architecture and generate a Mermaid graph TD diagram.",
        fallback_summary="The architecture agent summarized repository structure and component relationships.",
    )

    state["agent_steps"].append(
        {
            "title": "Architecture Agent",
            "description": "Generated an architecture explanation and diagram from repository context.",
            "status": "done",
        }
    )

    return state


def general_agent_node(state: AgentRequestState) -> AgentRequestState:
    state = run_specialized_agent(
        state,
        role="a General CodeCompass Agent",
        instructions="Provide the most helpful answer possible using the repository context.",
        fallback_summary="The general agent handled the request with broad repository reasoning.",
    )

    state["agent_steps"].append(
        {
            "title": "General Fallback Agent",
            "description": "Handled the request using general repository reasoning.",
            "status": "done",
        }
    )

    return state


def supervisor_finish_node(state: AgentRequestState) -> AgentRequestState:
    if not isinstance(state["workflow_diagram"], str) or not state["workflow_diagram"].strip().startswith("graph"):
        state["workflow_diagram"] = """
graph TD
  A[User Request] --> B[Request Router]
  B --> C[Specialized Agent]
  C --> D[Supervisor Agent]
  D --> E[Final Answer]
"""

    if not state["workflow_summary"]:
        state["workflow_summary"] = "The supervisor finalized the specialized workflow output."

    if not state["final_answer"]:
        state["final_answer"] = (
            "CodeCompass completed the workflow, but the specialized agent did not return a final answer."
        )

    state["agent_steps"].append(
        {
            "title": "Supervisor Agent",
            "description": "Reviewed the specialized agent result and prepared final output.",
            "status": "done",
        }
    )

    return state


def route_agent_request(state: AgentRequestState):
    if state["route"] == "human_review":
        return "human_review"
    if state["route"] == "repo_search":
        return "repo_search"
    if state["route"] == "issue_review":
        return "issue_review"
    if state["route"] == "architecture":
        return "architecture"
    return "general"


def build_agent_request_workflow():
    graph = StateGraph(AgentRequestState)

    graph.add_node("router", request_router_node)
    graph.add_node("repo_search", repo_search_agent_node)
    graph.add_node("human_review", human_review_agent_node)
    graph.add_node("issue_review", issue_review_agent_node)
    graph.add_node("architecture", architecture_agent_node)
    graph.add_node("general", general_agent_node)
    graph.add_node("supervisor", supervisor_finish_node)

    graph.set_entry_point("router")

    graph.add_conditional_edges(
        "router",
        route_agent_request,
        {
            "repo_search": "repo_search",
            "human_review": "human_review",
            "issue_review": "issue_review",
            "architecture": "architecture",
            "general": "general",
        },
    )

    graph.add_edge("repo_search", "supervisor")
    graph.add_edge("human_review", "supervisor")
    graph.add_edge("issue_review", "supervisor")
    graph.add_edge("architecture", "supervisor")
    graph.add_edge("general", "supervisor")
    graph.add_edge("supervisor", END)

    return graph.compile()


def run_agent_request_workflow(
    repo_url: str,
    user_request: str,
    important_files: List[dict],
    api_key: str | None = None,
):
    workflow = build_agent_request_workflow()

    initial_state: AgentRequestState = {
        "repo_url": repo_url,
        "user_request": user_request,
        "important_files": important_files,
        "api_key": api_key,
        "route": "",
        "workflow_summary": "",
        "workflow_diagram": "",
        "agent_steps": [],
        "final_answer": "",
    }

    return workflow.invoke(initial_state)
review_checkpointer = InMemorySaver()
compiled_review_workflows = {}


class HumanReviewState(TypedDict):
    repo_url: str
    user_request: str
    important_files: List[dict]
    api_key: str | None
    route: str
    workflow_summary: str
    workflow_diagram: str
    agent_steps: List[dict]
    final_answer: str
    human_decision: dict


def review_router_node(state: HumanReviewState) -> HumanReviewState:
    state["route"] = "human_review"

    state["agent_steps"].append(
        {
            "title": "Request Router",
            "description": "Detected that this request requires human review.",
            "status": "done",
        }
    )

    return state


def pre_review_agent_node(state: HumanReviewState) -> HumanReviewState:
    file_list = [file["path"] for file in state["important_files"][:5]]

    state["workflow_summary"] = (
        "The AI prepared a proposed action, but it must be approved by a human before continuing."
    )

    state["workflow_diagram"] = """
graph TD
  A[User Request] --> B[Repo Context Collector]
  B --> C[Human Review Interrupt]
  C --> D[Final Response Agent]
"""

    state["final_answer"] = (
        "Waiting for human approval before generating the final answer."
    )

    state["agent_steps"].append(
        {
            "title": "Pre-Review Agent",
            "description": "Collected repository context and prepared an action for human review.",
            "status": "done",
        }
    )

    state["human_decision"] = {
        "proposed_action": "Continue with repository analysis using the selected important files.",
        "user_request": state["user_request"],
        "files_to_review": file_list,
    }

    return state


def real_human_review_node(state: HumanReviewState) -> HumanReviewState:
    decision = interrupt(
        {
            "message": "Human approval required before continuing.",
            "proposed_action": state["human_decision"]["proposed_action"],
            "user_request": state["user_request"],
            "files_to_review": state["human_decision"]["files_to_review"],
            "options": ["approve", "reject", "edit"],
        }
    )

    state["human_decision"] = decision

    return state


def final_review_agent_result(
    state: HumanReviewState,
    effective_request: str,
    decision_type: str,
    feedback: str | None,
):
    prompt = f"""
You are a Final Response Agent in CodeCompass.

Original user request:
{state["user_request"]}

Effective reviewed instruction:
{effective_request}

Human decision:
{decision_type}

Human feedback:
{feedback or "No additional feedback."}

Repository context:
{build_repo_context(state["important_files"], 2000)}

Return ONLY valid JSON:
{{
  "final_answer": "the final reviewed answer grounded in repository context",
  "workflow_summary": "brief explanation of how the workflow completed after human review",
  "workflow_diagram": "Mermaid graph TD diagram"
}}
"""

    try:
        result = call_openai_json(prompt, api_key=state["api_key"])
    except Exception:
        result = {}

    return validate_workflow_result(result, state["repo_url"], effective_request)


def final_after_review_node(state: HumanReviewState) -> HumanReviewState:
    decision = state.get("human_decision", {})
    decision_type = decision.get("decision", "approve")
    feedback = decision.get("feedback")
    edited_instruction = (decision.get("edited_instruction") or "").strip()

    if decision_type == "reject":
        state["final_answer"] = (
            "The human reviewer rejected the proposed AI action. "
            f"Feedback: {feedback or 'No feedback provided.'}"
        )

        state["workflow_summary"] = "The workflow stopped because the human reviewer rejected the action."

        state["workflow_diagram"] = """
graph TD
  A[User Request] --> B[Human Review]
  B --> C[Rejected]
  C --> D[Workflow Stopped]
"""

    elif decision_type == "edit":
        effective_request = edited_instruction or state["user_request"]
        validated = final_review_agent_result(
            state,
            effective_request=effective_request,
            decision_type=decision_type,
            feedback=feedback,
        )

        state["final_answer"] = validated.get(
            "final_answer",
            "The workflow resumed after the human reviewer edited the instruction, but no final answer was generated.",
        )
        state["workflow_summary"] = validated.get(
            "workflow_summary",
            "The workflow resumed after the human reviewer edited the AI instruction.",
        )
        state["workflow_diagram"] = validated.get(
            "workflow_diagram",
            """
graph TD
  A[User Request] --> B[Human Review]
  B --> C[Edited Instruction]
  C --> D[Final Response Agent]
  D --> E[Supervisor Agent]
""",
        )

    else:
        validated = final_review_agent_result(
            state,
            effective_request=state["user_request"],
            decision_type=decision_type,
            feedback=feedback,
        )

        state["final_answer"] = validated.get(
            "final_answer",
            "The human reviewer approved the proposed action, but no final answer was generated.",
        )
        state["workflow_summary"] = validated.get(
            "workflow_summary",
            "The workflow resumed after human approval and completed successfully.",
        )
        state["workflow_diagram"] = validated.get(
            "workflow_diagram",
            """
graph TD
  A[User Request] --> B[Human Review]
  B --> C[Approved]
  C --> D[Final Response Agent]
  D --> E[Supervisor Agent]
""",
        )

    state["agent_steps"].append(
        {
            "title": "Human Review Step",
            "description": f"Human decision received: {decision_type}.",
            "status": "done",
        }
    )

    state["agent_steps"].append(
        {
            "title": "Final Response Agent",
            "description": "Generated final output after the human review decision.",
            "status": "done",
        }
    )

    state["agent_steps"].append(
        {
            "title": "Supervisor Agent",
            "description": "Confirmed the human-reviewed workflow result.",
            "status": "done",
        }
    )

    return state


def build_real_human_review_workflow():
    graph = StateGraph(HumanReviewState)

    graph.add_node("router", review_router_node)
    graph.add_node("pre_review", pre_review_agent_node)
    graph.add_node("human_review", real_human_review_node)
    graph.add_node("final_after_review", final_after_review_node)

    graph.set_entry_point("router")
    graph.add_edge("router", "pre_review")
    graph.add_edge("pre_review", "human_review")
    graph.add_edge("human_review", "final_after_review")
    graph.add_edge("final_after_review", END)

    return graph.compile(checkpointer=review_checkpointer)


def start_real_human_review_workflow(
    repo_url: str,
    user_request: str,
    important_files: List[dict],
    api_key: str | None = None,
):
    review_id = str(uuid.uuid4())
    workflow = build_real_human_review_workflow()
    compiled_review_workflows[review_id] = workflow

    config = {
        "configurable": {
            "thread_id": review_id,
        }
    }

    initial_state: HumanReviewState = {
        "repo_url": repo_url,
        "user_request": user_request,
        "important_files": important_files,
        "api_key": api_key,
        "route": "",
        "workflow_summary": "",
        "workflow_diagram": "",
        "agent_steps": [],
        "final_answer": "",
        "human_decision": {},
    }

    result = workflow.invoke(initial_state, config=config)

    interrupt_payload = None

    if "__interrupt__" in result:
        interrupt_payload = result["__interrupt__"][0].value

    agent_steps = result.get("agent_steps", []).copy()
    agent_steps.append(
        {
            "title": "Human Review Required",
            "description": "The LangGraph workflow paused using interrupt() and is waiting for user approval.",
            "status": "active",
        }
    )

    return {
        "review_id": review_id,
        "pending_review": True,
        "review_payload": interrupt_payload,
        "workflow_summary": "Workflow paused for human review.",
        "workflow_diagram": """
graph TD
  A[User Request] --> B[Pre-Review Agent]
  B --> C[Human Review Required]
  C --> D[Waiting for Decision]
""",
        "agent_steps": agent_steps,
        "route": "human_review",
        "final_answer": "Waiting for human review decision.",
    }


def resume_real_human_review_workflow(review_id: str, decision: dict):
    workflow = compiled_review_workflows.get(review_id)

    if workflow is None:
        workflow = build_real_human_review_workflow()
        compiled_review_workflows[review_id] = workflow

    config = {
        "configurable": {
            "thread_id": review_id,
        }
    }

    result = workflow.invoke(Command(resume=decision), config=config)

    return {
        "workflow_summary": result["workflow_summary"],
        "workflow_diagram": result["workflow_diagram"],
        "agent_steps": result["agent_steps"],
        "route": result["route"],
        "final_answer": result["final_answer"],
        "pending_review": False,
        "review_id": review_id,
        "review_payload": None,
    }
