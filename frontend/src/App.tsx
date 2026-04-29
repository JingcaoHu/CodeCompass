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
import { analyzeRepo, createAgentWorkflow } from "./lib/api";

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

    try {
      const result = await createAgentWorkflow(repoUrl, request, { apiKey });

      const mappedWorkflow: WorkflowResult = {
        workflowSummary: result.workflow_summary,
        workflowDiagram: result.workflow_diagram,
        agentSteps: result.agent_steps,
        finalAnswer: result.final_answer,
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
                  <AgentTimeline
                    steps={workflowResult?.agentSteps || analysis.agentSteps}
                  />

                  {isGeneratingWorkflow ? (
                    <LoadingSteps />
                  ) : (
                    <WorkflowViewer
                      request={
                        workflowRequest ||
                        "Default workflow: scan repository, summarize files, generate architecture diagram, and route output through a supervisor agent."
                      }
                      summary={workflowResult?.workflowSummary}
                      finalAnswer={workflowResult?.finalAnswer}
                      diagram={
                        workflowResult?.workflowDiagram || analysis.repoDiagram
                      }
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
