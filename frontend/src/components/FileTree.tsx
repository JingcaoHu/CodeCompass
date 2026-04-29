import { useState } from "react";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import type { FileNode } from "../types";

type Props = {
  files: FileNode[];
  selectedFile?: FileNode | null;
  onSelectFile: (file: FileNode) => void;
};

function TreeNode({
  node,
  depth = 0,
  selectedFile,
  onSelectFile,
}: {
  node: FileNode;
  depth?: number;
  selectedFile?: FileNode | null;
  onSelectFile: (file: FileNode) => void;
}) {
  const [open, setOpen] = useState(depth < 1);
  const isFolder = node.type === "folder";
  const isSelected = selectedFile?.path === node.path;

  function handleClick() {
    if (isFolder) {
      setOpen(!open);
    } else {
      onSelectFile(node);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        style={{ paddingLeft: depth * 14 }}
        className={
          isSelected
            ? "my-1 flex w-full items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-left text-sm text-blue-700"
            : "my-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
        }
      >
        {isFolder && (
          <ChevronRight
            className={open ? "h-4 w-4 rotate-90 transition" : "h-4 w-4 transition"}
          />
        )}

        {!isFolder && <span className="w-4" />}

        {isFolder ? (
          open ? (
            <FolderOpen className="h-4 w-4 text-yellow-600" />
          ) : (
            <Folder className="h-4 w-4 text-yellow-600" />
          )
        ) : (
          <File className="h-4 w-4 text-slate-500" />
        )}

        <span className="truncate">{node.name}</span>
      </button>

      {isFolder && open && node.children?.map((child) => (
        <TreeNode
          key={child.path ?? child.name}
          node={child}
          depth={depth + 1}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}

export default function FileTree({ files, selectedFile, onSelectFile }: Props) {
  return (
    <section className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Repo Structure</h2>
        <p className="text-sm text-slate-500">Click a file to view details.</p>
      </div>

      <div className="max-h-[620px] overflow-auto pr-1">
        {files.map((file) => (
          <TreeNode
            key={file.path ?? file.name}
            node={file}
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
          />
        ))}
      </div>
    </section>
  );
}