"use client";
import React,{useEffect,useRef} from "react";
import {createPortal} from "react-dom";
import {X} from "lucide-react";
import {clsx,type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";
function cn(...values:ClassValue[]){return twMerge(clsx(values));}
interface ModalProps{isOpen:boolean;onClose:()=>void;title?:string;children:React.ReactNode;width?:string;}
export default function Modal({isOpen,onClose,title,children,width="max-w-xl"}:ModalProps){
 const panel=useRef<HTMLDivElement>(null),close=useRef(onClose);
 useEffect(()=>{close.current=onClose;},[onClose]);
 useEffect(()=>{
  if(!isOpen)return;
  const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
  document.body.style.overflow="hidden";
  const nodes=()=>Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled):not([type="hidden"]),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')||[]).filter(node=>node.getClientRects().length&&node.getAttribute("aria-hidden")!=="true");
  const frame=requestAnimationFrame(()=>{(panel.current?.querySelector<HTMLElement>('input:not(:disabled):not([type="hidden"]),textarea:not(:disabled)')||nodes()[0]||panel.current)?.focus();});
  const key=(event:KeyboardEvent)=>{
   if(event.defaultPrevented||document.querySelector('[role="listbox"]'))return;
   if(event.key==="Escape"){event.preventDefault();close.current();return;}
   if(event.key!=="Tab")return;
   const focusable=nodes(),first=focusable[0],last=focusable.at(-1),active=document.activeElement;
   if(!first){event.preventDefault();panel.current?.focus();return;}
   if(event.shiftKey&&(active===first||!panel.current?.contains(active))){event.preventDefault();last?.focus();}
   else if(!event.shiftKey&&(active===last||!panel.current?.contains(active))){event.preventDefault();first.focus();}
  };
  document.addEventListener("keydown",key);
  return()=>{cancelAnimationFrame(frame);document.removeEventListener("keydown",key);document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus();};
 },[isOpen]);
 if(!isOpen||typeof document==="undefined")return null;
 return createPortal(<div role="dialog" aria-modal="true" aria-label={title||"Dialog"} className="screeno-crud-modal fixed inset-0 z-[100] flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-slate-900/60" onClick={onClose}/>
  <div ref={panel} tabIndex={-1} className={cn("screeno-dialog-panel relative w-full overflow-hidden rounded-[3px] bg-white shadow-sm flex flex-col max-h-[90dvh] outline-none",width)}>
   <div className="screeno-dialog-header flex items-center justify-between shrink-0"><h3>{title}</h3><button type="button" onClick={onClose} aria-label="Close dialog"><X size={17}/></button></div>
   <div className="screeno-dialog-body overflow-y-auto">{children}</div>
  </div>
 </div>,document.body);
}
