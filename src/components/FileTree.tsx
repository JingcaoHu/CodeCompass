import type { FileNode } from "../types";
import { ChevronRight, File, Folder } from "lucide-react";

function TreeNode({
  node,
  depth = 0,
  parentPath = "",
}: {
  node: FileNode;
  depth?: number;
  parentPath?: string;
}) {
  const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;

  return (
    <div className="space-y-2" style={{ marginLeft: depth * 14 }}>
      <div className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
        {node.type === "folder" ? (
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <span className="w-3.5" />
        )}
        {node.type === "folder" ? (
          <Folder className="h-4 w-4 text-amber-500" />
        ) : (
          <File className="h-4 w-4 text-slate-400" />
        )}
        <span className={node.type === "folder" ? "font-medium text-slate-900" : ""}>
          {node.name}
        </span>
      </div>

      {node.children?.map((child) => (
        <TreeNode
          key={`${currentPath}/${child.name}`}
          node={child}
          depth={depth + 1}
          parentPath={currentPath}
        />
      ))}
    </div>
  );
}

export default function FileTree({ files }: { files: FileNode[] }) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
      <h2 className="mb-1 text-xl font-semibold text-slate-950">Repo Structure</h2>
      <p className="mb-4 text-sm text-slate-500">
        A simplified tree to orient the review before drilling into implementation details.
      </p>
      <div className="space-y-3">
        {files.map((file) => (
          <TreeNode key={file.name} node={file} />
        ))}
      </div>
    </section>
  );
}
