import { useState } from "react";
import { CheckCircle2, Edit3, ShieldCheck, XCircle } from "lucide-react";
import type { WorkflowResult } from "../types";

type Props = {
  result: WorkflowResult | null;
  onDecision: (
    decision: "approve" | "reject" | "edit",
    editedInstruction?: string,
    feedback?: string
  ) => void;
  isSubmitting: boolean;
};

export default function HumanReviewPanel({
  result,
  onDecision,
  isSubmitting,
}: Props) {
  const [editedInstruction, setEditedInstruction] = useState("");
  const [feedback, setFeedback] = useState("");
  const canSubmitEdit = editedInstruction.trim().length > 0;

  if (!result?.pendingReview || !result.reviewPayload) return null;

  return (
    <section className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-white p-3">
          <ShieldCheck className="h-6 w-6 text-orange-600" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-orange-950">
            Human Review Required
          </h2>
          <p className="text-sm text-orange-800">
            LangGraph paused this workflow with interrupt(). Choose how to continue.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Proposed Action
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {result.reviewPayload.proposed_action}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            User Request
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {result.reviewPayload.user_request}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Files to Review
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {result.reviewPayload.files_to_review?.map((file) => (
              <li key={file}>{file}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <textarea
          value={editedInstruction}
          onChange={(e) => setEditedInstruction(e.target.value)}
          placeholder="Optional edited instruction..."
          className="min-h-24 rounded-xl border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
        />

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Optional rejection feedback..."
          className="min-h-24 rounded-xl border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          disabled={isSubmitting}
          onClick={() => onDecision("approve")}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle2 className="h-5 w-5" />
          Approve
        </button>

        <button
          disabled={isSubmitting || !canSubmitEdit}
          onClick={() => onDecision("edit", editedInstruction)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Edit3 className="h-5 w-5" />
          Edit & Continue
        </button>

        <button
          disabled={isSubmitting}
          onClick={() => onDecision("reject", undefined, feedback)}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          <XCircle className="h-5 w-5" />
          Reject
        </button>
      </div>
    </section>
  );
}
