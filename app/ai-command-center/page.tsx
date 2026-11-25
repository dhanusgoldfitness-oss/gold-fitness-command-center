import Workspace from "./Workspace";
import { agents, secretary, approvalRules } from "@/lib/agents";

function Card({ a, big = false }: { a: (typeof agents)[number]; big?: boolean }) {
  return (
    <section
      className={`rounded-2xl border border-[#d4af37]/30 bg-[#161616] p-5 ${
        big ? "md:col-span-2" : ""
      }`}
    >
      <p className="text-xs uppercase tracking-widest text-[#d4af37]">{a.role}</p>
      <h2 className="mt-1 text-xl font-semibold text-white">{a.name}</h2>
      <p className="mt-2 text-sm text-neutral-300">{a.summary}</p>
      <ul className="mt-3 space-y-1 text-sm text-neutral-400">
        {a.duties.map((d) => (
          <li key={d}>• {d}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[#d4af37]">
        Needs your approval: {a.needsApproval.join("; ")}
      </p>
    </section>
  );
}

export default function CommandCenter() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold text-[#d4af37]">Gold Fitness AI Command Center</h1>
      <p className="mt-1 text-sm text-neutral-400">Kengeri · 1 secretary + 4 team members</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card a={secretary} big />
        {agents.map((a) => (
          <Card key={a.id} a={a} />
        ))}
      </div>

      <Workspace />

      <section className="mt-4 rounded-2xl border border-neutral-800 bg-[#111] p-5">
        <h2 className="font-semibold text-white">Working rules</h2>
        <ul className="mt-2 space-y-1 text-sm text-neutral-400">
          {approvalRules.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
