import {FileSearch,MessagesSquare,FlaskConical,Workflow,Route,ShieldCheck,ChartNoAxesCombined,SearchCheck,BadgeCheck,Languages} from "lucide-react";
export const hiringTools=[
 {id:"evidence",label:"Evidence review",group:"Review tools",icon:FileSearch,description:"Check skills, work samples and the sources behind an applicant's claims.",candidate:true},
 {id:"screening",label:"Interview guides",group:"Review tools",icon:MessagesSquare,description:"Prepare structured questions and record feedback against the same criteria.",candidate:true},
 {id:"simulations",label:"Work sample tasks",group:"Review tools",icon:FlaskConical,description:"Use practical tasks to see how someone approaches real work.",candidate:true},
 {id:"workflows",label:"Hiring workflows",group:"Hiring operations",icon:Workflow,description:"Prepare and approve the next actions in a hiring campaign.",candidate:false},
 {id:"journey",label:"Application pipeline",group:"Hiring operations",icon:Route,description:"Track each application stage, next step and expected update.",candidate:true},
 {id:"rediscovery",label:"Talent rediscovery",group:"Hiring operations",icon:SearchCheck,description:"Find people in your talent pool who may fit another role.",candidate:true},
 {id:"roi",label:"Hiring reports",group:"Hiring operations",icon:ChartNoAxesCombined,description:"Review recorded time, costs and outcomes to improve your process.",candidate:false},
 {id:"audit",label:"Decision log",group:"Trust & access",icon:ShieldCheck,description:"Record review reasons, corrections and changes to hiring decisions.",candidate:false},
 {id:"verification",label:"Verification checks",group:"Trust & access",icon:BadgeCheck,description:"Track what has been checked, what is missing and what needs review.",candidate:true},
 {id:"inclusion",label:"Access & language",group:"Trust & access",icon:Languages,description:"Manage language, text options and requests for adjustments.",candidate:true}
] as const;
export const candidateToolCopy:Record<string,{label:string;description:string}>={
 evidence:{label:"My skills & work",description:"Add skills and work examples, then choose what to share with hiring teams."},
 screening:{label:"Interview preparation",description:"Prepare for interviews and keep questions and feedback in one place."},
 simulations:{label:"Work sample tasks",description:"Open practical tasks, save your work and read review notes."},
 journey:{label:"Application updates",description:"See each application stage and what you need to do next."},
 rediscovery:{label:"Future roles",description:"Choose whether recruiters can contact you about other opportunities."},
 verification:{label:"Verification requests",description:"See what has been requested and approve what you share."},
 inclusion:{label:"Access & language",description:"Set reading options, language and requests for adjustments."}
};