import { Bot, FolderTree, GitBranch, Home, Settings } from "lucide-react";
import type { TabKey } from "./DashboardTabs";

type Props = {
  activeTab: TabKey;
  onNavigate: (tab: TabKey) => void;
  onOpenSettings: () => void;
};

const navItems: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: "overview", label: "Dashboard", icon: Home },
  { key: "files", label: "Repo Structure", icon: FolderTree },
  { key: "workflow", label: "Workflow", icon: GitBranch },
  { key: "issues", label: "AI Agents", icon: Bot },
];

export default function Sidebar({ activeTab, onNavigate, onOpenSettings }: Props) {
  return (
    <aside className="hidden min-h-screen w-64 border-r bg-white p-5 lg:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">CodeCompass</h1>
        <p className="text-sm text-slate-500">AI Repo Analysis</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={
                isActive
                  ? "flex w-full items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-left text-blue-700"
                  : "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 hover:bg-slate-100"
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-10 border-t pt-5">
        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 hover:bg-slate-100"
        >
          <Settings className="h-5 w-5" />
          API Settings
        </button>
      </div>
    </aside>
  );
}
