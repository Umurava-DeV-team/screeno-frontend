"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
import {MotionConfig,motion,useAnimate,useReducedMotion,useScroll,useSpring,stagger,inView} from "motion/react";
import {Pause,Play} from "lucide-react";
import {useBootReady} from "./AppBootLoader";
const MotionSettings=createContext({paused:false,reduced:false,toggle:()=>{}});
export function useLandingMotion(){return useContext(MotionSettings);}
export function MotionToggle(){
  const {paused,toggle}=useLandingMotion();
  return <button className="screeno-motion-toggle" type="button" onClick={toggle} aria-pressed={paused}>
    {paused?<Play size={12}/>:<Pause size={12}/>} {paused?"Resume animations":"Pause animations"}
  </button>;
}
export default function LandingMotion({children}:{children:ReactNode}){
  const [paused,setPaused]=useState(false);
  const ready=useBootReady();
  const reduced=useReducedMotion();
  const [scope,animate]=useAnimate<HTMLDivElement>();
  const {scrollYProgress}=useScroll();
  const progress=useSpring(scrollYProgress,{stiffness:140,damping:30});
  useEffect(()=>{
    if(!scope.current || reduced || paused || !ready)return;
    const originals=new Map<Element,string|null>();
    const controls:Array<{stop:()=>void}>=[];
    const reveal=(elements:Element[],distance=28)=>{
      if(!elements.length)return;
      elements.forEach(element=>{if(!originals.has(element))originals.set(element,element.getAttribute("style"));});
      controls.push(animate(elements,{opacity:[0,1],y:[distance*1.5,0],rotateX:[12,0],filter:["blur(10px)","blur(0px)"],...(elements.every(element=>element.matches(".ts-hero-title"))?{clipPath:["inset(0 0 15% 0)","inset(0 0 0% 0)"]}:{})},{duration:1.05,delay:stagger(.1),ease:[.22,1,.36,1]}));
    };
    reveal(Array.from(scope.current.querySelectorAll(".ts-site-header")), -14);
    // Observe each visible block, so content further down a tall section does not animate early.
    const stop=inView(Array.from(scope.current.querySelectorAll(
      ".ts-landing-hero .screeno-section-label,.ts-hero-title,.ts-hero-description,#opportunity-search,.ts-services-intro,.ts-open-service,.screeno-section-intro,.screeno-audience-tabs,.screeno-timeline-caption,.screeno-timeline-entry,.screeno-timeline-footer,.screeno-workspace-hub,.screeno-comparison,.screeno-faq-list > details,.screeno-next-inner,.screeno-footer-identity,.screeno-footer-invitation"
    )),element=>{reveal([element],36);},{amount:.25});
    const sections=Array.from(scope.current.querySelectorAll("main > section,footer"));
    const visibility=new IntersectionObserver(entries=>{
      entries.forEach(entry=>entry.target.setAttribute("data-motion-in-view",String(entry.isIntersecting)));
    },{threshold:0});
    sections.forEach(section=>visibility.observe(section));
    return ()=>{
      stop();visibility.disconnect();sections.forEach(section=>section.removeAttribute("data-motion-in-view"));controls.forEach(control=>control.stop());
      originals.forEach((style,element)=>{if(style===null)element.removeAttribute("style");else element.setAttribute("style",style);});
    };
  },[animate,scope,reduced,paused,ready]);
  return <MotionConfig reducedMotion={paused?"always":"user"}>
    <MotionSettings.Provider value={{paused,reduced:!!reduced,toggle:()=>setPaused(value=>!value)}}>
      <div id="top" className="ts-site ts-screeno-site" data-motion-paused={paused} ref={scope}>
        <motion.div className="screeno-scroll-progress" style={{scaleX:progress}} aria-hidden="true"/>
        {children}
      </div>
    </MotionSettings.Provider>
  </MotionConfig>;
}
