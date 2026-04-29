import { Compass } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200/80 bg-white/75 px-4 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-2 text-white shadow-lg shadow-blue-600/20">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-lg font-semibold tracking-tight text-slate-950">
              CodeCompass
            </span>
            <span className="block text-sm text-slate-500">
              Frontend repository intelligence workspace
            </span>
          </div>
        </div>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
          AI GitHub repo analysis
        </div>
      </div>
    </nav>
  );
}
