import ArchitectureDiagram from "./ArchitectureDiagram";

type Props = {
  request: string;
  diagram: string;
};

export default function WorkflowViewer({ request, diagram }: Props) {
  if (!request) return null;

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="mb-2 text-xl font-semibold text-slate-950">
              Generated Agent Workflow
            </h2>
            <p className="text-sm text-slate-500">Requested change</p>
          </div>
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            Human-in-the-loop
          </span>
        </div>
        <p className="mt-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-slate-700">
          {request}
        </p>

        <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          LangGraph routes this request through a supervisor, assigns targeted repo
          search, inserts a human review gate, gathers code context, and then
          prepares the final answer.
        </div>
      </div>

      <ArchitectureDiagram chart={diagram} />
    </section>
  );
}
