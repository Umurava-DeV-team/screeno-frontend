"use client";
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {AnimatePresence,motion,MotionConfig} from "motion/react";
import Loading from "@/app/loading";
const BootReady=createContext(true);
export function useBootReady(){return useContext(BootReady);}
export default function AppBootLoader({children}:{children:ReactNode}){
 const [loading,setLoading]=useState(true);
 const overlay=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let active=true;
  const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
  overlay.current?.focus();
  const timers:ReturnType<typeof setTimeout>[]=[];
  const delay=(ms:number)=>new Promise<void>(resolve=>{timers.push(setTimeout(resolve,ms));});
  const minimum=delay(650);
  const ceiling=delay(2000);
  void Promise.race([Promise.all([minimum,document.fonts.ready]),ceiling]).then(()=>{timers.forEach(clearTimeout);if(active){setLoading(false);if(previous?.isConnected)previous.focus({preventScroll:true});}});
  return()=>{active=false;timers.forEach(clearTimeout);};
 },[]);
 return <BootReady.Provider value={!loading}><div inert={loading?true:undefined}>{children}</div><MotionConfig reducedMotion="user"><AnimatePresence>{loading&&<motion.div key="boot" ref={overlay} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Loading Screeno" className="screeno-boot-overlay" exit={{opacity:0}} transition={{duration:.2}}><Loading/></motion.div>}</AnimatePresence></MotionConfig></BootReady.Provider>;
}
