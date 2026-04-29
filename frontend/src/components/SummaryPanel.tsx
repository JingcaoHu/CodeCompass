import type { FileSummary, Issue } from "../types";

type Props = {
  summary: string;
  fileSummaries: FileSummary[];
  issues: Issue[];
};

export default function SummaryPanel({ summary, fileSummaries, issues }: Props) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Project Summary</h2>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Completed
          </span>
        </div>

        <p className="leading-7 text-slate-700">{summary}</p>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Important File Summaries</h2>

        <div className="grid gap-3">
          {fileSummaries.map((item) => (
            <div
              key={item.filePath}
              className="rounded-2xl border bg-slate-50 p-4 hover:bg-white"
            >
              <h3 className="font-semibold text-slate-900">{item.filePath}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Possible Issues</h2>

        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.title} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{issue.title}</h3>
                <span
                  className={
                    issue.severity === "High"
                      ? "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                      : issue.severity === "Medium"
                      ? "rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700"
                      : "rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                  }
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