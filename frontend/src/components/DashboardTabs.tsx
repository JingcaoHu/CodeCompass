type TabKey = "overview" | "files" | "workflow" | "issues";

type Props = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "files", label: "Files" },
  { key: "workflow", label: "Agent Workflow" },
  { key: "issues", label: "Issues" },
];

export default function DashboardTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-2 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={
              activeTab === tab.key
                ? "rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { TabKey };