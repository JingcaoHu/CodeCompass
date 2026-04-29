import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { AgentStep } from "../types";

export default function AgentTimeline({ steps }: { steps: AgentStep[] }) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-semibold">Agent Steps Timeline</h2>
      <p className="mb-6 text-sm text-slate-500">
        This shows how LangGraph coordinates the repo analysis process.
      </p>

      <div className="space-y-5">
        {steps.map((step, index) => (
          <div key={step.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              {step.status === "done" && (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              )}

              {step.status === "active" && (
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              )}

              {step.status === "pending" && (
                <Circle className="h-6 w-6 text-slate-300" />
              )}

              {index !== steps.length - 1 && (
                <div className="mt-2 h-10 w-px bg-slate-200" />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}