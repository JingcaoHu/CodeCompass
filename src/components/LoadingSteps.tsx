import { CheckCircle2 } from "lucide-react";

const steps = [
  "Fetching GitHub repository",
  "Scanning repo files",
  "Filtering unnecessary files",
  "Running LangGraph workflow",
  "Generating project diagram",
  "Preparing dashboard",
];

export default function LoadingSteps() {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Analysis Progress</h2>
          <p className="mt-1 text-sm text-slate-500">
            The current demo completes each review step in order before rendering the dashboard.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          Complete
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
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
