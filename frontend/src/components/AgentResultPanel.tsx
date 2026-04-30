import { Bot, GitBranch, MessageSquareText, Route } from "lucide-react";
import type { WorkflowResult } from "../types";

type Props = {
  result: WorkflowResult | null;
  request: string;
  isLoading?: boolean;
};

function formatRoute(route?: string) {
  if (!route) return "Not selected yet";

  return route
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function inferRoute(result: WorkflowResult | null, request: string) {
  if (result?.route) {
    return result.route;
  }

  const stepTitles = (result?.agentSteps || [])
    .map((step) => step.title.toLowerCase())
    .join(" ");

  if (stepTitles.includes("human review")) {
    return "human_review";
  }
  if (stepTitles.includes("repo search")) {
    return "repo_search";
  }
  if (stepTitles.includes("issue review")) {
    return "issue_review";
  }
  if (stepTitles.includes("architecture")) {
    return "architecture";
  }
  if (stepTitles.includes("general")) {
    return "general";
  }

  const normalizedRequest = request.toLowerCase();
  if (
    normalizedRequest.includes("human") ||
    normalizedRequest.includes("manual") ||
    normalizedRequest.includes("review")
  ) {
    return "human_review";
  }
  if (
    normalizedRequest.includes("search") ||
    normalizedRequest.includes("find") ||
    normalizedRequest.includes("where")
  ) {
    return "repo_search";
  }
  if (
    normalizedRequest.includes("issue") ||
    normalizedRequest.includes("bug") ||
    normalizedRequest.includes("problem")
  ) {
    return "issue_review";
  }
  if (
    normalizedRequest.includes("architecture") ||
    normalizedRequest.includes("diagram") ||
    normalizedRequest.includes("structure")
  ) {
    return "architecture";
  }

  return result ? "general" : undefined;
}

export default function AgentResultPanel({ result, request, isLoading = false }: Props) {
  const selectedRoute = inferRoute(result, request);

  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-blue-50 p-3">
          <Bot className="h-6 w-6 text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Dynamic Agent Result
          </h2>
          <p className="text-sm text-slate-500">
            LangGraph selected a route and executed a specialized agent workflow.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <MessageSquareText className="h-4 w-4" />
            User Request
          </div>
          <p className="text-sm leading-6 text-slate-700">
            {request || "No workflow request submitted yet."}
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
            <Route className="h-4 w-4" />
            Selected Route
          </div>
          <p className="text-lg font-bold text-blue-900">
            {isLoading ? "Selecting route..." : formatRoute(selectedRoute)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
          <GitBranch className="h-4 w-4" />
          Workflow Summary
        </div>
        <p className="text-sm leading-6 text-slate-700">
          {(isLoading && "The request router is classifying your prompt and preparing a specialized workflow.") ||
            result?.workflowSummary ||
            "After you submit a request, the backend will return a workflow summary here."}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Bot className="h-4 w-4" />
          Final Answer
        </div>
        <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
          {(isLoading && "CodeCompass is executing the selected workflow and preparing the specialized agent response.") ||
            result?.finalAnswer ||
            "The final specialized agent answer will appear here."}
        </p>
      </div>
    </section>
  );
}
