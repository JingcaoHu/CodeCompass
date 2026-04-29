import { GitBranch, Loader2 } from "lucide-react";

type Props = {
  repoUrl: string;
  setRepoUrl: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
};

export default function RepoInputCard({
  repoUrl,
  setRepoUrl,
  onAnalyze,
  isAnalyzing,
}: Props) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-slate-100 p-3">
          <GitBranch className="h-7 w-7 text-slate-800" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Analyze a GitHub Repository
          </h1>
          <p className="text-sm text-slate-500">
            Paste a public GitHub URL to start the repo analysis workflow.
          </p>
        </div>
      </div>

      <form
        className="flex flex-col gap-3 md:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          onAnalyze();
        }}
      >
        <input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/user/repository"
          className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={isAnalyzing}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isAnalyzing && <Loader2 className="h-5 w-5 animate-spin" />}
          {isAnalyzing ? "Analyzing..." : "Analyze Repo"}
        </button>
      </form>
    </section>
  );
}
