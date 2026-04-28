import { useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import RepoInputCard from "./components/RepoInputCard";
import LoadingSteps from "./components/LoadingSteps";
import FileTree from "./components/FileTree";
import SummaryPanel from "./components/SummaryPanel";
import ArchitectureDiagram from "./components/ArchitectureDiagram";
import AgentRequestBox from "./components/AgentRequestBox";
import WorkflowViewer from "./components/WorkflowViewer";
import {
  mockFileTree,
  mockSummary,
  mockFileSummaries,
  mockIssues,
  repoDiagram,
  workflowDiagram,
} from "./data/mockData";

function getRepositoryLabel(repoUrl: string) {
  try {
    const url = new URL(repoUrl);
    if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
      return repoUrl;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      return `${segments[0]}/${segments[1]}`;
    }
  } catch {
    return repoUrl;
  }

  return repoUrl;
}

function isValidGithubRepositoryUrl(repoUrl: string) {
  try {
    const url = new URL(repoUrl);
    const segments = url.pathname.split("/").filter(Boolean);

    return (
      (url.hostname === "github.com" || url.hostname === "www.github.com") &&
      segments.length >= 2
    );
  } catch {
    return false;
  }
}

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [workflowRequest, setWorkflowRequest] = useState("");
  const [repoError, setRepoError] = useState("");
  const [workflowError, setWorkflowError] = useState("");

  const repositoryLabel = useMemo(() => {
    if (!analyzed) return "";
    return getRepositoryLabel(repoUrl.trim());
  }, [analyzed, repoUrl]);

  function handleAnalyze() {
    const trimmedUrl = repoUrl.trim();

    if (!trimmedUrl) {
      setRepoError("Enter a GitHub repository URL to start the analysis.");
      return;
    }

    if (!isValidGithubRepositoryUrl(trimmedUrl)) {
      setRepoError(
        "Use a valid GitHub repository URL, for example https://github.com/user/repo.",
      );
      return;
    }

    setRepoError("");
    setWorkflowError("");
    setRepoUrl(trimmedUrl);
    setAnalyzed(true);
  }

  function handleGenerateWorkflow(request: string) {
    if (!request.trim()) {
      setWorkflowError(
        "Describe the workflow change you want before generating it.",
      );
      return;
    }

    setWorkflowError("");
    setWorkflowRequest(request.trim());
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_38%,_#f8fafc_100%)]">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <RepoInputCard
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          onAnalyze={handleAnalyze}
          error={repoError}
          analyzed={analyzed}
          repositoryLabel={repositoryLabel}
        />

        {analyzed && (
          <>
            <LoadingSteps />

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
                <p className="text-sm font-medium text-slate-500">Repository</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {repositoryLabel}
                </p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
                <p className="text-sm font-medium text-slate-500">Analysis Mode</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  Frontend architecture review
                </p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
                <p className="text-sm font-medium text-slate-500">Coverage</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  Structure, risks, workflow
                </p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
                <p className="text-sm font-medium text-slate-500">Status</p>
                <p className="mt-2 text-lg font-semibold text-emerald-700">
                  Ready for review
                </p>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <FileTree files={mockFileTree} />
              </div>

              <div className="space-y-6 lg:col-span-5">
                <SummaryPanel
                  summary={mockSummary}
                  fileSummaries={mockFileSummaries}
                  issues={mockIssues}
                />
              </div>

              <div className="space-y-6 lg:col-span-4">
                <ArchitectureDiagram chart={repoDiagram} />
                <AgentRequestBox
                  onGenerateWorkflow={handleGenerateWorkflow}
                  error={workflowError}
                />
              </div>
            </div>

            <WorkflowViewer request={workflowRequest} diagram={workflowDiagram} />
          </>
        )}
      </main>
    </div>
  );
}
