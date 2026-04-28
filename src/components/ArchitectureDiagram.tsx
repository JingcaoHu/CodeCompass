import { useEffect, useRef } from "react";
import mermaid from "mermaid";

export default function ArchitectureDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      suppressErrorRendering: true,
    });

    async function renderDiagram() {
      if (!ref.current) return;
      const container = ref.current;

      try {
        const id = `diagram-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, chart);
        container.innerHTML = svg;
      } catch {
        container.innerHTML = `
          <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Diagram rendering failed. Review the Mermaid definition and try again.
          </div>
        `;
      }
    }

    renderDiagram();
  }, [chart]);

  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
      <h2 className="mb-1 text-xl font-semibold text-slate-950">Project Logic Diagram</h2>
      <p className="mb-4 text-sm text-slate-500">
        A lightweight architecture sketch generated from the current analysis context.
      </p>
      <div
        ref={ref}
        className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      />
    </section>
  );
}
