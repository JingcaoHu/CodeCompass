import { CheckCircle2, Loader2 } from "lucide-react";

const defaultSteps = [
  "Fetching GitHub repository",
  "Scanning repo files",
  "Filtering unnecessary files",
  "Running LangGraph workflow",
  "Generating project diagram",
  "Preparing dashboard",
];

type Props = {
  title?: string;
  description?: string;
  statusLabel?: string;
  steps?: string[];
  isComplete?: boolean;
};

export default function LoadingSteps({
  title = "Analysis Progress",
  description = "The current demo completes each review step in order before rendering the dashboard.",
  statusLabel,
  steps = defaultSteps,
  isComplete = false,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            isComplete
              ? "bg-emerald-50 text-emerald-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {statusLabel || (isComplete ? "Complete" : "In Progress")}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4"
          >
            {isComplete ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-blue-600" />
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Step {index + 1}
              </p>
              <span className="mt-1 block text-sm font-medium text-slate-700">{step}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
