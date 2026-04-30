import { useState } from "react";
import Sidebar from "./components/Sidebar";
import StatusBar from "./components/StatusBar";
import ApiKeyModal from "./components/ApiKeyModal";
import RepoInputCard from "./components/RepoInputCard";
import LoadingSteps from "./components/LoadingSteps";
import FileTree from "./components/FileTree";
import SummaryPanel from "./components/SummaryPanel";
import ArchitectureDiagram from "./components/ArchitectureDiagram";
import AgentRequestBox from "./components/AgentRequestBox";
import WorkflowViewer from "./components/WorkflowViewer";
import EmptyState from "./components/EmptyState";
import ErrorAlert from "./components/ErrorAlert";
import DashboardTabs from "./components/DashboardTabs";
import type { TabKey } from "./components/DashboardTabs";
import AgentTimeline from "./components/AgentTimeline";
import DetailPanel from "./components/DetailPanel";
import StatsCards from "./components/StatsCards";
import type { FileNode, ProjectAnalysis, WorkflowResult } from "./types";
import HumanReviewPanel from "./components/HumanReviewPanel";
import { analyzeRepo, createAgentWorkflow, resumeHumanReview } from "./lib/api";
import AgentResultPanel from "./components/AgentResultPanel";

function inferWorkflowRoute(request: string) {
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

  return "general";
}

function getWorkflowLoadingSteps(request: string): WorkflowResult["agentSteps"] {
  const route = inferWorkflowRoute(request);
  const routeTitleMap: Record<string, string> = {
    human_review: "Human Review Agent",
    repo_search: "Repo Search Agent",
    issue_review: "Issue Review Agent",
    architecture: "Architecture Agent",
    general: "General Fallback Agent",
  };

  return [
    {
      title: "Request Router",
      description: "Classifying the workflow request and selecting the best specialized route.",
      status: "done",
    },
    {
      title: routeTitleMap[route],
      description: "Running the selected LangGraph agent with repository context.",
      status: "active",
    },
    {
      title: "Supervisor Agent",
      description: "Reviewing the specialized result and preparing the final answer.",
      status: "pending",
    },
  ];
}

export default function App() {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("openai_api_key") ?? ""
  );
  const [repoUrl, setRepoUrl] = useState("");
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(
    null
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);

  const [workflowRequest, setWorkflowRequest] = useState("");
  const [repoError, setRepoError] = useState("");
  const [workflowError, setWorkflowError] = useState("");
  const [apiKeyError, setApiKeyError] = useState("");
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  const analyzed = analysis !== null;
  const apiKeySaved = apiKey.trim().length > 0;
  const defaultWorkflowRequest =
    "Default workflow: scan repository, summarize files, generate architecture diagram, and route output through a supervisor agent.";
  const activeWorkflowRequest = workflowRequest || defaultWorkflowRequest;
  const workflowTimelineSteps =
    workflowResult?.agentSteps ||
    (isGeneratingWorkflow
      ? getWorkflowLoadingSteps(activeWorkflowRequest)
      : analysis?.agentSteps || []);

  function isValidGithubUrl(url: string) {
    return /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(url.trim());
  }

  async function handleAnalyze() {
    setRepoError("");

    if (!repoUrl.trim()) {
      setRepoError("Please enter a GitHub repository URL.");
      return;
    }

    if (!isValidGithubUrl(repoUrl)) {
      setRepoError(
        "Please enter a valid GitHub repo URL, such as https://github.com/user/repo.",
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setWorkflowResult(null);
    setWorkflowRequest("");
    setWorkflowError("");
    setSelectedFile(null);
    setActiveTab("overview");

    try {
      const result = await analyzeRepo(repoUrl, { apiKey });

      const mappedResult: ProjectAnalysis = {
        projectName: result.project_name,
        repoUrl: result.repo_url,
        summary: result.summary,
        fileTree: result.file_tree,
        fileSummaries: result.file_summaries,
        issues: result.issues,
        repoDiagram: result.repo_diagram,
        agentSteps: result.agent_steps,
      };

      setAnalysis(mappedResult);
    } catch (err) {
      console.warn("Repository analysis failed.", err);
      setRepoError(
        err instanceof Error
          ? err.message
          : "Failed to analyze repository.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleGenerateWorkflow(request: string) {
    setWorkflowError("");

    if (!request.trim()) {
      setWorkflowError("Please enter a workflow request.");
      return;
    }

    if (!repoUrl.trim()) {
      setWorkflowError("Please analyze a GitHub repository first.");
      return;
    }

    setWorkflowRequest(request.trim());
    setIsGeneratingWorkflow(true);
    setActiveTab("workflow");
    setWorkflowResult(null);

    try {
      const result = await createAgentWorkflow(repoUrl, request, { apiKey });

      const mappedWorkflow: WorkflowResult = {
        workflowSummary: result.workflow_summary,
        workflowDiagram: result.workflow_diagram,
        agentSteps: result.agent_steps,
        route: result.route,
        finalAnswer: result.final_answer,
        pendingReview: result.pending_review,
        reviewId: result.review_id,
        reviewPayload: result.review_payload,
      };

      setWorkflowResult(mappedWorkflow);
    } catch (err) {
      console.warn("Workflow generation failed.", err);
      setWorkflowError(
        err instanceof Error
          ? err.message
          : "Failed to create agent workflow.",
      );
    } finally {
      setIsGeneratingWorkflow(false);
    }
  }

  async function handleHumanReviewDecision(
    decision: "approve" | "reject" | "edit",
    editedInstruction?: string,
    feedback?: string
  ) {
    setWorkflowError("");
  
    if (!workflowResult?.reviewId) {
      setWorkflowError("No pending human review found.");
      return;
    }

    if (decision === "edit" && !editedInstruction?.trim()) {
      setWorkflowError("Please enter an edited instruction before continuing.");
      return;
    }
  
    setIsGeneratingWorkflow(true);
  
    try {
      const result = await resumeHumanReview({
        review_id: workflowResult.reviewId,
        decision,
        edited_instruction: editedInstruction,
        feedback,
      }, { apiKey });
  
      const mappedWorkflow: WorkflowResult = {
        workflowSummary: result.workflow_summary,
        workflowDiagram: result.workflow_diagram,
        agentSteps: result.agent_steps,
        route: result.route,
        finalAnswer: result.final_answer,
        pendingReview: result.pending_review,
        reviewId: result.review_id,
        reviewPayload: result.review_payload,
      };
  
      setWorkflowResult(mappedWorkflow);
    } catch (err) {
      console.warn("Human review resume failed.", err);
      setWorkflowError(
        err instanceof Error
          ? err.message
          : "Failed to resume human review workflow."
      );
    } finally {
      setIsGeneratingWorkflow(false);
    }
  }

  function handleSaveApiKey(key: string) {
    if (!key.trim()) {
      setApiKeyError("Please enter an API key.");
      return;
    }

    setApiKeyError("");
    const trimmedKey = key.trim();
    setApiKey(trimmedKey);
    localStorage.setItem("openai_api_key", trimmedKey);
    setApiModalOpen(false);
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onOpenSettings={() => setApiModalOpen(true)}
      />

      <ApiKeyModal
        isOpen={apiModalOpen}
        onClose={() => {
          setApiKeyError("");
          setApiModalOpen(false);
        }}
        onSave={handleSaveApiKey}
        error={apiKeyError}
      />

      <main className="flex-1 space-y-6 px-6 py-6">
        <StatusBar
          hasApiKey={apiKeySaved}
          isAnalyzing={isAnalyzing || isGeneratingWorkflow}
        />

        <ErrorAlert message={repoError} onClose={() => setRepoError("")} />

        <RepoInputCard
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />

        {!analyzed && !isAnalyzing && <EmptyState />}

        {isAnalyzing && <LoadingSteps />}

        {analysis && (
          <>
            <StatsCards
              fileCount={analysis.fileSummaries.length}
              agentStepCount={analysis.agentSteps.length}
              workflowGraphCount={workflowResult ? 2 : 1}
              issueCount={analysis.issues.length}
            />

            <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "overview" && (
              <div className="grid gap-6 xl:grid-cols-12">
                <div className="xl:col-span-3">
                  <FileTree
                    files={analysis.fileTree}
                    selectedFile={selectedFile}
                    onSelectFile={setSelectedFile}
                  />
                </div>

                <div className="space-y-6 xl:col-span-6">
                  <SummaryPanel
                    summary={analysis.summary}
                    fileSummaries={analysis.fileSummaries}
                    issues={analysis.issues}
                  />
                  <ArchitectureDiagram chart={analysis.repoDiagram} />
                </div>

                <div className="xl:col-span-3">
                  <DetailPanel
                    selectedFile={selectedFile}
                    issues={analysis.issues}
                  />
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div className="grid gap-6 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <FileTree
                    files={analysis.fileTree}
                    selectedFile={selectedFile}
                    onSelectFile={setSelectedFile}
                  />
                </div>

                <div className="xl:col-span-8">
                  <DetailPanel
                    selectedFile={selectedFile}
                    issues={analysis.issues}
                  />
                </div>
              </div>
            )}

            {activeTab === "workflow" && (
              <div className="grid gap-6 xl:grid-cols-12">
                <div className="space-y-6 xl:col-span-7">
                  <ErrorAlert
                    message={workflowError}
                    onClose={() => setWorkflowError("")}
                  />

                  <AgentResultPanel
                    result={workflowResult}
                    request={
                      workflowRequest ||
                      "Default workflow: scan repository, summarize files, generate architecture diagram, and route output through a supervisor agent."
                    }
                  />

                  <HumanReviewPanel
                    result={workflowResult}
                    onDecision={handleHumanReviewDecision}
                    isSubmitting={isGeneratingWorkflow}
                  />

                  <AgentTimeline steps={workflowTimelineSteps} />

                  {isGeneratingWorkflow ? (
                    <LoadingSteps
                      title="Workflow Execution"
                      description="LangGraph is routing your request, running a specialized agent, and assembling the final response."
                      statusLabel="Executing"
                      steps={[
                        "Classifying the user request",
                        "Selecting a specialized route",
                        "Reading cached repository context",
                        "Running the selected agent",
                        "Reviewing output in the supervisor node",
                        "Preparing the final workflow response",
                      ]}
                    />
                  ) : (
                    <WorkflowViewer
                      request={activeWorkflowRequest}
                      summary={workflowResult?.workflowSummary}
                      finalAnswer={workflowResult?.finalAnswer}
                      route={workflowResult?.route}
                      stepCount={workflowTimelineSteps.length}
                      isLoading={isGeneratingWorkflow}
                      diagram={workflowResult?.workflowDiagram || analysis.repoDiagram}
                    />
                  )}
                </div>

                <div className="space-y-6 xl:col-span-5">
                  <AgentRequestBox
                    onGenerateWorkflow={handleGenerateWorkflow}
                    error={workflowError}
                  />
                  <ArchitectureDiagram chart={analysis.repoDiagram} />
                </div>
              </div>
            )}

            {activeTab === "issues" && (
              <div className="grid gap-6 xl:grid-cols-12">
                <div className="xl:col-span-8">
                  <SummaryPanel
                    summary={analysis.summary}
                    fileSummaries={analysis.fileSummaries}
                    issues={analysis.issues}
                  />
                </div>

                <div className="xl:col-span-4">
                  <AgentTimeline steps={analysis.agentSteps} />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
