import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";

type Props = {
  hasApiKey: boolean;
  isAnalyzing: boolean;
};

export default function StatusBar({ hasApiKey, isAnalyzing }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white px-5 py-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Repository Analysis Workspace
        </h2>
        <p className="text-sm text-slate-500">
          Analyze GitHub repositories with a supervised LangGraph AI workflow.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm">
          <KeyRound className="h-4 w-4" />
          {hasApiKey ? "API Key Connected" : "API Key Missing"}
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm">
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
          {isAnalyzing ? "Analyzing" : "Ready"}
        </div>
      </div>
    </div>
  );
}