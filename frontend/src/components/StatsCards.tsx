import { Bot, FileCode2, GitBranch, ShieldAlert } from "lucide-react";

type Props = {
  fileCount: number;
  agentStepCount: number;
  workflowGraphCount: number;
  issueCount: number;
};

export default function StatsCards({
  fileCount,
  agentStepCount,
  workflowGraphCount,
  issueCount,
}: Props) {
  const stats = [
    {
      label: "Files Scanned",
      value: String(fileCount),
      icon: FileCode2,
    },
    {
      label: "Agent Steps",
      value: String(agentStepCount),
      icon: Bot,
    },
    {
      label: "Workflow Graphs",
      value: String(workflowGraphCount),
      icon: GitBranch,
    },
    {
      label: "Issues Found",
      value: String(issueCount),
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.label} className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>

            <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            <p className="text-sm text-slate-500">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
