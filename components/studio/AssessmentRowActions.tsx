"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Archive, ArrowUpRight, ClipboardCheck, Eye, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";

export default function AssessmentRowActions({ id, title, status, onAction }: {
  id: string; title: string; status: string; onAction: (kind: "delete" | "archive") => void;
}) {
  const [open, setOpen] = useState(false), [position, setPosition] = useState({ top: 0, left: 0 });
  const trigger = useRef<HTMLButtonElement>(null), menu = useRef<HTMLDivElement>(null), menuId = useId();
  const draft = status === "draft";
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const dismiss = (event: PointerEvent) => { if (!trigger.current?.contains(event.target as Node) && !menu.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    const reposition = (event: Event) => { if (!(event.target instanceof Node) || !menu.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss); document.addEventListener("keydown", escape);
    window.addEventListener("resize", reposition); window.addEventListener("scroll", reposition, true);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); window.removeEventListener("resize", reposition); window.removeEventListener("scroll", reposition, true); };
  }, [open]);
  function toggle() {
    if (open) { setOpen(false); return; }
    const rect = trigger.current!.getBoundingClientRect(), height = draft ? 177 : status === "active" ? 144 : 111;
    setPosition({ top: innerHeight - rect.bottom >= height ? rect.bottom + 6 : Math.max(8, rect.top - height), left: Math.max(8, Math.min(innerWidth - 204, rect.right - 196)) });
    setOpen(true);
  }
  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Tab") { setOpen(false); return; }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') || []), index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  }
  function action(kind: "delete" | "archive") { setOpen(false); trigger.current?.focus(); onAction(kind); }
  return <div className="assessment-row-controls">
    <Link className="assessment-open-link" href={draft ? "/recruiter/assessments/edit/" + id : "/recruiter/assessments/" + id} aria-label={(draft ? "Edit " : "Results for ") + title}>{draft ? "Edit draft" : "Results"}<ArrowUpRight size={12} /></Link>
    <button ref={trigger} type="button" className="assessment-more-trigger" aria-label={"More actions for " + title} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} onClick={toggle}><MoreHorizontal size={17} /></button>
    {open && createPortal(<div ref={menu} id={menuId} role="menu" aria-label={"Actions for " + title} className="assessment-action-menu" style={position} onKeyDown={navigate}>
      <p>Assessment actions</p>
      <Link role="menuitem" href={"/recruiter/assessments/preview/" + id} onClick={() => setOpen(false)}><Eye size={14} />Preview assessment</Link>
      {draft ? <>
        <Link role="menuitem" href={"/recruiter/assessments/edit/" + id} onClick={() => setOpen(false)}><Pencil size={14} />Edit draft</Link>
        <Link role="menuitem" href={"/recruiter/assessments/launch/" + id} onClick={() => setOpen(false)}><Send size={14} />Assign to candidates</Link>
        <button role="menuitem" type="button" className="danger" onClick={() => action("delete")}><Trash2 size={14} />Delete draft</button>
      </> : <>
        <Link role="menuitem" href={"/recruiter/assessments/" + id} onClick={() => setOpen(false)}><ClipboardCheck size={14} />View results</Link>
        {status === "active" && <button role="menuitem" type="button" onClick={() => action("archive")}><Archive size={14} />Archive assessment</button>}
      </>}
    </div>, document.body)}
  </div>;
}
