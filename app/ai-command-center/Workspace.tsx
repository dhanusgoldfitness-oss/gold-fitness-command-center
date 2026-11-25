"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { routeTask } from "@/lib/route";

type Task = { id: string; agent_id: string; title: string; status: string; created_at: string };
type Approval = {
  id: string;
  task_id: string | null;
  agent_id: string;
  action: string;
  status: string;
  created_at: string;
  payload: { message_id?: string; phone?: string } | null;
};

const box = "rounded-2xl border border-neutral-800 bg-[#111] p-5";
const input =
  "w-full rounded-lg border border-neutral-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]";
const gold = "rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50";

export default function Workspace() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState("");
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const t = await supabase.from("cc_tasks").select("*").order("created_at", { ascending: false }).limit(20);
    const a = await supabase
      .from("cc_approvals")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (t.error || a.error) {
      setMsg("Signed in, but this account is not the owner, so nothing is shown.");
      return;
    }
    setMsg("");
    setTasks(t.data as Task[]);
    setApprovals(a.data as Approval[]);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  async function auth(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    if (res.error) setMsg(res.error.message);
    else if (mode === "up" && !res.data.session) setMsg("Check your email to confirm, then sign in.");
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const { agent, needsApproval } = routeTask(text.trim());
    const task = await supabase
      .from("cc_tasks")
      .insert({ agent_id: agent, title: text.trim(), status: needsApproval ? "waiting_approval" : "open" })
      .select()
      .single();
    if (task.error) return setMsg(task.error.message);
    if (needsApproval) {
      await supabase.from("cc_approvals").insert({
        task_id: task.data.id,
        agent_id: agent,
        action: text.trim(),
      });
    }
    setText("");
    load();
  }

  async function decide(a: Approval, ok: boolean) {
    // WhatsApp reply drafts go through the secure send function; nothing is sent without this tap.
    if (a.payload?.message_id) {
      const { data, error } = await supabase.functions.invoke("approve-send", {
        body: { approval_id: a.id, text: edits[a.id], reject: !ok },
      });
      if (error || data?.error) setMsg(data?.detail || data?.error || error?.message || "Could not send");
      else setMsg("");
      load();
      return;
    }
    await supabase
      .from("cc_approvals")
      .update({ status: ok ? "approved" : "rejected", decided_at: new Date().toISOString() })
      .eq("id", a.id);
    await supabase
      .from("cc_tasks")
      .update({ status: ok ? "open" : "cancelled" })
      .eq("id", a.task_id ?? "");
    load();
  }

  async function setStatus(t: Task, status: string) {
    await supabase.from("cc_tasks").update({ status }).eq("id", t.id);
    load();
  }

  if (!ready) return null;

  if (!session)
    return (
      <form onSubmit={auth} className={`${box} mt-6 space-y-3`}>
        <h2 className="font-semibold text-white">Owner login</h2>
        <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        <div className="flex items-center gap-3">
          <button className={gold}>{mode === "in" ? "Sign in" : "Create account"}</button>
          <button type="button" className="text-xs text-neutral-400 underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "First time? Create account" : "Have an account? Sign in"}
          </button>
        </div>
        {msg && <p className="text-sm text-[#d4af37]">{msg}</p>}
      </form>
    );

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>Signed in as {session.user.email}</span>
        <button className="underline" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
      {msg && <p className="text-sm text-[#d4af37]">{msg}</p>}

      <form onSubmit={addTask} className={`${box} space-y-3`}>
        <h2 className="font-semibold text-white">Tell your secretary</h2>
        <input className={input} placeholder="e.g. Follow up with this week's trial leads" value={text} onChange={(e) => setText(e.target.value)} />
        <button className={gold}>Assign</button>
        <p className="text-xs text-neutral-500">
          Routing uses keywords for now. Anything about prices, offers, payments or bulk messages waits for your approval.
        </p>
      </form>

      <section className={box}>
        <h2 className="font-semibold text-white">Approval queue</h2>
        {approvals.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">Nothing waiting.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {approvals.map((a) => (
              <li key={a.id} className="space-y-2 text-sm">
                <span className="text-neutral-200">
                  <b className="text-[#d4af37]">{a.agent_id}</b>
                  {a.payload?.message_id ? ` → WhatsApp ${a.payload.phone ?? ""}` : `: ${a.action}`}
                </span>
                {a.payload?.message_id && (
                  <textarea
                    className={input}
                    rows={4}
                    defaultValue={a.action.replace(/^Reply to [^:]*: /, "")}
                    onChange={(e) => setEdits({ ...edits, [a.id]: e.target.value })}
                  />
                )}
                <span className="flex gap-2">
                  <button className={gold} onClick={() => decide(a, true)}>
                    {a.payload?.message_id ? "Approve & send" : "Approve"}
                  </button>
                  <button className="rounded-lg border border-neutral-600 px-3 py-2 text-xs text-white" onClick={() => decide(a, false)}>Reject</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={box}>
        <h2 className="font-semibold text-white">Tasks</h2>
        {tasks.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">No tasks yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-neutral-200">
                  <b className="text-[#d4af37]">{t.agent_id}</b>: {t.title}
                  <span className="ml-2 text-xs text-neutral-500">{t.status}</span>
                </span>
                {(t.status === "open" || t.status === "in_progress") && (
                  <button className="text-xs text-neutral-300 underline" onClick={() => setStatus(t, "done")}>Mark done</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
