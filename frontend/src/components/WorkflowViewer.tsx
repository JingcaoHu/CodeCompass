import ArchitectureDiagram from "./ArchitectureDiagram";

type Props = {
  request: string;
  diagram: string;
  summary?: string;
  finalAnswer?: string;
  route?: string;
  stepCount?: number;
  isLoading?: boolean;
};

function formatRoute(route?: string) {
  if (!route) return "Not selected yet";

  return route
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default function WorkflowViewer({
  request,
  diagram,
  summary,
  finalAnswer,
  route,
  stepCount = 0,
  isLoading = false,
}: Props) {
  if (!request) return null;

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Generated Agent Workflow</h2>

        <p className="text-sm text-slate-500">User request:</p>
        <p className="mt-1 rounded-xl bg-slate-50 p-4 text-slate-700">
          {request}
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Selected Route
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {isLoading ? "Selecting route..." : formatRoute(route)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Agent Steps
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {stepCount || 0} step{stepCount === 1 ? "" : "s"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Execution State
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {isLoading ? "Running specialized workflow" : "Supervisor completed"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          {summary ||
            "LangGraph will route this request through a Supervisor Agent, then assign a specialized Repo Search Agent, add a human review step, collect code context, and generate the final answer."}
        </div>

        {finalAnswer && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Final answer</p>
            <p className="mt-2 text-sm leading-6 text-slate-800">{finalAnswer}</p>
          </div>
        )}
      </div>

      <ArchitectureDiagram chart={diagram} />
    </section>
  );
}
