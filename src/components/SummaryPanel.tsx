import type { FileSummary, Issue } from "../types";

type Props = {
  summary: string;
  fileSummaries: FileSummary[];
  issues: Issue[];
};

export default function SummaryPanel({ summary, fileSummaries, issues }: Props) {
  const severityClasses: Record<Issue["severity"], string> = {
    Low: "bg-emerald-50 text-emerald-700",
    Medium: "bg-amber-50 text-amber-700",
    High: "bg-rose-50 text-rose-700",
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
        <h2 className="mb-3 text-xl font-semibold text-slate-950">Project Summary</h2>
        <p className="leading-7 text-slate-700">{summary}</p>
      </div>

      <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
        <h2 className="mb-1 text-xl font-semibold text-slate-950">Important File Summaries</h2>
        <p className="mb-4 text-sm text-slate-500">
          These are the files a reviewer should open first to understand the product surface.
        </p>
        <div className="space-y-3">
          {fileSummaries.map((item) => (
            <div
              key={item.filePath}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4"
            >
              <h3 className="font-semibold text-slate-900">{item.filePath}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
        <h2 className="mb-1 text-xl font-semibold text-slate-950">Possible Issues</h2>
        <p className="mb-4 text-sm text-slate-500">
          Risks are grouped by severity so the next pass can prioritize the right work.
        </p>
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.title}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{issue.title}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClasses[issue.severity]}`}
                >
                  {issue.severity}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {issue.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
