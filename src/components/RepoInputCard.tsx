import { GitBranch, Search, ShieldCheck, Sparkles } from "lucide-react";

type Props = {
  repoUrl: string;
  setRepoUrl: (value: string) => void;
  onAnalyze: () => void;
  error: string;
  analyzed: boolean;
  repositoryLabel: string;
};

const highlights = [
  "Surface high-risk files and architecture hot spots",
  "Translate repo structure into a readable dashboard",
  "Draft agent workflows that are easier to review and refine",
];

export default function RepoInputCard({
  repoUrl,
  setRepoUrl,
  onAnalyze,
  error,
  analyzed,
  repositoryLabel,
}: Props) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[1.45fr_0.95fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <Sparkles className="h-4 w-4" />
            Guided repository review
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Understand a frontend codebase before you change it.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Paste a GitHub repository URL to generate a structured overview of the project,
              its critical files, known risks, and a workflow that is practical to extend.
            </p>
          </div>

          <form
            className="mt-8 flex flex-col gap-3 md:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              onAnalyze();
            }}
          >
            <div className="relative flex-1">
              <GitBranch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repository"
                aria-invalid={Boolean(error)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
            >
              <Search className="h-4 w-4" />
              Analyze Repo
            </button>
          </form>

          <div className="mt-3 min-h-6">
            {error ? (
              <p className="text-sm font-medium text-rose-600">{error}</p>
            ) : (
              <p className="text-sm text-slate-500">
                Supports standard GitHub repository URLs with owner and repo name.
              </p>
            )}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-6 text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="border-t border-slate-200/80 bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8fbff_100%)] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
          <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-[0_16px_50px_rgba(59,130,246,0.12)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Review checklist
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
              Keep the first pass actionable
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li>Map the repo structure before touching implementation details.</li>
              <li>Call out risky files, brittle integration points, and missing boundaries.</li>
              <li>Generate workflows that still make sense to a human reviewer.</li>
            </ul>

            <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">Current workspace status</p>
              <p className="mt-2 text-xl font-semibold">
                {analyzed ? repositoryLabel : "Waiting for repository input"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {analyzed
                  ? "The dashboard below is ready with a structured overview and workflow tools."
                  : "Run an analysis to populate the architecture, issue summary, and agent workflow sections."}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
