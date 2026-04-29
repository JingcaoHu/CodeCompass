import { FileCode2, Info, ShieldAlert } from "lucide-react";
import type { FileNode, Issue } from "../types";

type Props = {
  selectedFile: FileNode | null;
  issues: Issue[];
};

export default function DetailPanel({ selectedFile, issues }: Props) {
  return (
    <aside className="space-y-5">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Details</h2>
        </div>

        {selectedFile ? (
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-slate-600" />
                <h3 className="font-semibold">{selectedFile.name}</h3>
              </div>

              <p className="text-sm text-slate-500">{selectedFile.path}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Language
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {selectedFile.language ?? "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                AI Summary
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {selectedFile.summary ?? "No summary available for this file yet."}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-500">
            Select a file from the repo structure to inspect its path, language,
            and AI-generated summary.
          </p>
        )}
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-semibold">Risk Summary</h2>
        </div>

        <div className="space-y-3">
          {issues.slice(0, 2).map((issue) => (
            <div key={issue.title} className="rounded-2xl bg-orange-50 p-4">
              <p className="font-semibold text-orange-900">{issue.title}</p>
              <p className="mt-1 text-sm text-orange-800">{issue.description}</p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}