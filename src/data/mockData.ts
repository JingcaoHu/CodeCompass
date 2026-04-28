import type { FileNode, FileSummary, Issue } from "../types";

export const mockFileTree: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "components",
        type: "folder",
        children: [
          { name: "RepoInputCard.tsx", type: "file" },
          { name: "SummaryPanel.tsx", type: "file" },
          { name: "ArchitectureDiagram.tsx", type: "file" },
        ],
      },
      {
        name: "data",
        type: "folder",
        children: [{ name: "mockData.ts", type: "file" }],
      },
      {
        name: "types",
        type: "folder",
        children: [{ name: "index.ts", type: "file" }],
      },
      { name: "App.tsx", type: "file" },
      { name: "main.tsx", type: "file" },
    ],
  },
  {
    name: "project-root",
    type: "folder",
    children: [
      { name: "package.json", type: "file" },
      { name: "vite.config.ts", type: "file" },
      { name: "README.md", type: "file" },
      {
        name: "public",
        type: "folder",
        children: [{ name: "favicon.svg", type: "file" }],
      },
    ],
  },
];

export const mockSummary =
  "This frontend project presents a repository analysis workspace. It guides the user from GitHub URL input into a structured dashboard that summarizes important files, flags risks, visualizes architecture, and sketches a human-reviewable agent workflow for follow-up work.";

export const mockFileSummaries: FileSummary[] = [
  {
    filePath: "src/App.tsx",
    summary:
      "Orchestrates the dashboard state, validates GitHub input, and connects the analysis, summary, and workflow sections together.",
  },
  {
    filePath: "src/components/RepoInputCard.tsx",
    summary:
      "Owns the repository entry experience, including the primary call to action and the guidance that frames the review flow.",
  },
  {
    filePath: "src/components/ArchitectureDiagram.tsx",
    summary:
      "Renders Mermaid output and provides the visualization layer for architecture and workflow diagrams.",
  },
];

export const mockIssues: Issue[] = [
  {
    title: "Analysis is currently demo-backed",
    severity: "Low",
    description:
      "The current interface renders mocked analysis results rather than live repository data, so the UI is realistic but not yet connected to a backend service.",
  },
  {
    title: "Large repository workflows need progressive loading",
    severity: "Medium",
    description:
      "Real repositories with deep trees or generated files will need filtering, batching, and clearer loading states to keep the interface responsive.",
  },
  {
    title: "Diagram rendering depends on valid Mermaid syntax",
    severity: "Medium",
    description:
      "If an invalid diagram definition is supplied, the viewer must fail gracefully and preserve the rest of the dashboard experience.",
  },
];

export const repoDiagram = `
graph TD
  A[User enters GitHub URL] --> B[React Frontend]
  B --> C[FastAPI Backend]
  C --> D[Repo Scanner]
  D --> E[LangGraph Workflow]
  E --> F[Summary Agent]
  E --> G[Diagram Agent]
  E --> H[Supervisor Agent]
  H --> I[Final Dashboard Output]
`;

export const workflowDiagram = `
graph TD
  A[User Request] --> B[Supervisor Agent]
  B --> C[Repo Search Agent]
  C --> D[Human Review Step]
  D --> E[Code Context Collector]
  E --> F[Final AI Response]
`;
