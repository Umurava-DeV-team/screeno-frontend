"use client";
import {useEffect,useRef,useState,type KeyboardEvent} from "react";
import {Download,ChevronDown,FileText,Table2,Loader2} from "lucide-react";
import {exportCsv,exportPdf,type ReportData} from "@/lib/reportExport";
export default function ExportMenu({report,disabled=false}:{report:ReportData;disabled?:boolean}){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(""),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  if(!open)return;
  root.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
  const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
  const escape=(event:globalThis.KeyboardEvent)=>{if(event.key==="Escape"){setOpen(false);trigger.current?.focus();}};
  document.addEventListener("pointerdown",close);document.addEventListener("keydown",escape);
  return()=>{document.removeEventListener("pointerdown",close);document.removeEventListener("keydown",escape);};
 },[open]);
 async function choose(format:"csv"|"pdf"){setOpen(false);setError("");setBusy(true);try{if(format==="csv")exportCsv(report);else await exportPdf(report);}catch{setError("Could not prepare the export. Please try again.");}finally{setBusy(false);trigger.current?.focus();}}
 function navigate(event:KeyboardEvent<HTMLDivElement>){const items=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')),index=items.indexOf(document.activeElement as HTMLButtonElement);if(["ArrowDown","ArrowUp","Home","End"].includes(event.key)){event.preventDefault();const next=event.key==="Home"?0:event.key==="End"?items.length-1:(index+(event.key==="ArrowDown"?1:-1)+items.length)%items.length;items[next]?.focus();}else if(event.key==="Tab")setOpen(false);}
 return <div className="screeno-export-menu" ref={root}><button type="button" ref={trigger} disabled={disabled||busy} aria-expanded={open} aria-haspopup="menu" className="screeno-outline-button" onClick={()=>setOpen(!open)} onKeyDown={event=>{if(event.key==="ArrowDown"){event.preventDefault();setOpen(true);}}}>{busy?<Loader2 size={14} className="animate-spin"/>:<Download size={14}/>} {busy?"Preparing export…":"Export"}<ChevronDown size={12}/></button>{open&&<div role="menu" aria-label="Export format" onKeyDown={navigate}><button type="button" role="menuitem" onClick={()=>void choose("csv")}><Table2 size={16}/><span>CSV spreadsheet<small>All filtered records</small></span></button><button type="button" role="menuitem" onClick={()=>void choose("pdf")}><FileText size={16}/><span>Styled PDF report<small>Formatted report · numbered pages</small></span></button></div>}{error&&<p role="alert">{error}</p>}</div>;
}