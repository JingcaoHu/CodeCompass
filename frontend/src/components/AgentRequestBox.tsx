import { useState } from "react";

type Props = {
  onGenerateWorkflow: (request: string) => void;
  error: string;
};

export default function AgentRequestBox({ onGenerateWorkflow, error }: Props) {
  const [request, setRequest] = useState("");

  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
      <h2 className="mb-3 text-xl font-semibold text-slate-950">
        Create a Supervised AI Workflow
      </h2>
      <p className="mb-4 text-sm leading-6 text-slate-500">
        Ask CodeCompass to generate a reviewable workflow adjustment for this repository.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onGenerateWorkflow(request);
        }}
      >
        <textarea
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="Example: Add a human search step before the final project summary."
          aria-invalid={Boolean(error)}
          className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />

        <div className="mt-3 min-h-6">
          {error ? (
            <p className="text-sm font-medium text-rose-600">{error}</p>
          ) : (
            <p className="text-sm text-slate-500">
              Be specific about extra review steps, approval gates, or context collection.
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
        >
          Generate Workflow
        </button>
      </form>
    </section>
  );
}
