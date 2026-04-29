import type { AgentStep, FileNode, FileSummary, Issue } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

type RequestOptions = {
  apiKey?: string;
};

export type AnalyzeRepoRequest = {
  repo_url: string;
};

export type AnalyzeRepoResponse = {
  project_name: string;
  repo_url: string;
  summary: string;
  file_tree: FileNode[];
  file_summaries: FileSummary[];
  issues: Issue[];
  repo_diagram: string;
  agent_steps: AgentStep[];
};

export type AgentRequestPayload = {
  repo_url: string;
  user_request: string;
};

export type AgentRequestResponse = {
  workflow_summary: string;
  workflow_diagram: string;
  agent_steps: AgentStep[];
  final_answer: string;
};

export async function analyzeRepo(
  repoUrl: string,
  options: RequestOptions = {}
): Promise<AnalyzeRepoResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze-repo`, {
    method: "POST",
    headers: buildHeaders(options),
    body: JSON.stringify({
      repo_url: repoUrl,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to analyze repository."));
  }

  return response.json();
}

export async function createAgentWorkflow(
  repoUrl: string,
  userRequest: string,
  options: RequestOptions = {}
): Promise<AgentRequestResponse> {
  const response = await fetch(`${API_BASE_URL}/agent-request`, {
    method: "POST",
    headers: buildHeaders(options),
    body: JSON.stringify({
      repo_url: repoUrl,
      user_request: userRequest,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to create agent workflow."));
  }

  return response.json();
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return data.detail || data.message || fallback;
  } catch {
    return fallback;
  }
}

function buildHeaders(options: RequestOptions) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.apiKey?.trim()) {
    headers["x-openai-api-key"] = options.apiKey.trim();
  }

  return headers;
}
