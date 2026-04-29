import { GitBranch } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <GitBranch className="h-8 w-8 text-blue-600" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900">
        No repository analyzed yet
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-slate-500">
        Enter a GitHub repository URL above. CodeCompass will scan the repo,
        summarize the project, generate a logic diagram, and prepare a supervised
        LangGraph workflow.
      </p>
    </div>
  );
}
