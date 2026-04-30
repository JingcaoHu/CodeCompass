export type FileNode = {
    name: string;
    type: "file" | "folder";
    path?: string;
    language?: string;
    summary?: string;
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
  
  export type AgentStep = {
    title: string;
    description: string;
    status: "done" | "active" | "pending";
  };
  
  export type ProjectAnalysis = {
    projectName: string;
    repoUrl: string;
    summary: string;
    fileTree: FileNode[];
    fileSummaries: FileSummary[];
    issues: Issue[];
    repoDiagram: string;
    agentSteps: AgentStep[];
  };
  
  export type WorkflowResult = {
    workflowSummary: string;
    workflowDiagram: string;
    agentSteps: AgentStep[];
    route?: string;
    finalAnswer?: string;
    pendingReview?: boolean;
    reviewId?: string | null;
    reviewPayload?: {
      message?: string;
      proposed_action?: string;
      user_request?: string;
      files_to_review?: string[];
      options?: string[];
    } | null;
  };
