"use client";
import {useId,useState} from "react";
import Link from "next/link";
import {motion,AnimatePresence} from "motion/react";
import {Users,UserRound,FileSearch,FlaskConical,BriefcaseBusiness,ShieldCheck,ListChecks,MessageSquareText,ArrowUpRight,Check,Route,Settings2} from "lucide-react";
import {useLandingMotion} from "./LandingMotion";
import ScreenoMark from "./ScreenoMark";
const workspaces={
 pipeline:{name:"Hiring team",href:"/auth/recruiter/login",action:"Try the hiring tools",nodes:[
  {icon:Users,title:"People applying",text:"See each person’s experience and work in one place."},
  {icon:FlaskConical,title:"Job tasks",text:"Set a task to see how someone would do the job."},
  {icon:BriefcaseBusiness,title:"Applications",text:"See who applied, what the job needs, and what happens next."},
  {icon:FileSearch,title:"Skills and work",text:"Check shared work, find missing details, and review changes."},
  {icon:ListChecks,title:"Review guidelines",text:"Use the same review guidelines for everyone and keep your notes."},
  {icon:Route,title:"Next steps",text:"Choose what happens next and record why."}
 ]},
 reviews:{name:"Team review",href:"/auth/recruiter/login",action:"Open the recruiter demo",nodes:[
  {icon:UserRound,title:"Reviewers",text:"Bring your team’s reviews and feedback together."},
  {icon:BriefcaseBusiness,title:"Job requirements",text:"Agree on the skills and experience the job needs."},
  {icon:FlaskConical,title:"Submitted work",text:"Review each applicant’s work against clear guidelines."},
  {icon:MessageSquareText,title:"Team feedback",text:"Share notes and questions with other reviewers."},
  {icon:Settings2,title:"Review guidelines",text:"Use the same guidelines for a fairer review."},
  {icon:ShieldCheck,title:"Final decisions",text:"Record your team’s choice and the reasons behind it."}
 ]}
};
export default function ScreenoWorkspaceHub(){
 const [role,setRole]=useState<"pipeline"|"reviews">("pipeline");
 const [selected,setSelected]=useState(0);
 const {reduced,paused}=useLandingMotion();
 const id=useId();
 const workspace=workspaces[role],feature=workspace.nodes[selected];
 return <div className="screeno-workspace-hub">
  <div className="screeno-hub-switch" aria-label="Explore recruiter tools">
   {(["pipeline","reviews"] as const).map(value=><button key={value} type="button" aria-pressed={role===value} onClick={()=>{setRole(value);setSelected(0);}}>
    {role===value&&<motion.span className="screeno-hub-switch-active" layoutId="screeno-workspace-selection" transition={{type:"spring",stiffness:380,damping:32}}/>}
    <span>{value==="pipeline"?"Manage applicants":"Review as a team"}</span>
   </button>)}
  </div>
  <div className="screeno-hub-stage">
   <svg className="screeno-hub-wires" viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true">
    {[65,180,295].map(y=><g key={y}><path d={"M130 "+y+" C290 "+y+" 230 180 400 180"}/><path d={"M870 "+y+" C710 "+y+" 770 180 600 180"}/></g>)}
   </svg>
   <div className="screeno-hub-nodes hub-inputs">
    {workspace.nodes.slice(0,3).map((node,index)=><button key={node.title} type="button" aria-pressed={selected===index} aria-controls={id} onClick={()=>setSelected(index)}><span><node.icon size={20}/></span>{node.title}</button>)}
   </div>
   <motion.div className="screeno-hub-core screeno-hiring-console" whileHover={paused||reduced?{}:{y:-4}} transition={{type:"spring",stiffness:200,damping:22}}>
    <div className="screeno-console-heading"><ScreenoMark size={32}/><div><p>YOUR HIRING DESK</p><h3>{workspace.name}</h3></div><span>Preview</span></div>
    <div className="screeno-console-body">
     <div className="screeno-console-caption"><span>From first application to final review</span><span>Sample workflow</span></div>
     <div className="screeno-console-stages" aria-label="Hiring workflow preview">
      {[{icon:Users,title:"Applicants",text:"Keep track"},{icon:FileSearch,title:"Reviews",text:"Share feedback"},{icon:Check,title:"Decisions",text:"Record the next step"}].map((stage,index)=><div key={stage.title}><span className="screeno-console-stage-number">0{index+1}</span><stage.icon size={20} aria-hidden="true"/><strong>{stage.title}</strong><small>{stage.text}</small></div>)}
     </div>
     <div id={id} aria-live="polite" aria-atomic="true" className="screeno-console-detail">
      <AnimatePresence mode="wait" initial={false}>
       <motion.div key={role+"-"+selected} initial={{opacity:0,y:reduced||paused?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:reduced||paused?0:.16}}>
        <span className="screeno-console-detail-icon"><feature.icon size={19}/></span><div><p>Explore this tool</p><h4>{feature.title}</h4><p>{feature.text}</p></div>
       </motion.div>
      </AnimatePresence>
     </div>
    </div>
    <div className="screeno-console-footer"><ShieldCheck size={13}/><span>Your team stays in control.</span><ArrowUpRight size={13}/></div>
   </motion.div>

   <div className="screeno-hub-nodes hub-outputs">
    {workspace.nodes.slice(3).map((node,index)=><button key={node.title} type="button" aria-pressed={selected===index+3} aria-controls={id} onClick={()=>setSelected(index+3)}><span><node.icon size={20}/></span>{node.title}</button>)}
   </div>
  </div>
  <div className="screeno-hub-entry"><Link href={workspace.href} className="ts-button">{workspace.action}<ArrowUpRight size={15}/></Link><Link href="#how-it-works" className="ts-text-link">See the hiring steps <ArrowUpRight size={13}/></Link></div>
 </div>;
}
