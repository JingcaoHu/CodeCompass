export type FileNode = {
    name: string;
    type: "file" | "folder";
    children?: FileNode[];
  };
  
  export type FileSummary = {
    filePath: string;
    summary: string;
  };
  
  export type Issue = {
    title: string;
    severity: "Low" | "Medium" | "High";
    description: string;
  };
  