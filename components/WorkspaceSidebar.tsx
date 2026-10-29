"use client";
import {useState} from "react";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {LayoutDashboard,Briefcase,Users,ShieldCheck,FileText,LogOut,Menu,X,Settings,User,Bell,GitBranch} from "lucide-react";
import {motion} from "motion/react";
import Brand from "./Brand";
import {useAppDispatch} from "@/lib/store/hooks";
import {logout} from "@/lib/store/features/authSlice";
export default function WorkspaceSidebar({role}:{role:"recruiter"|"candidate"}){
 const pathname=usePathname(),router=useRouter(),dispatch=useAppDispatch(),[open,setOpen]=useState(false),root="/"+role;
 const main=role==="recruiter"?[{label:"Jobs",icon:Briefcase,path:"/jobs"},{label:"Candidates",icon:Users,path:"/candidates"},{label:"Screenings",icon:ShieldCheck,path:"/screenings"},{label:"Assessments",icon:FileText,path:"/assessments"}]:[{label:"Overview",icon:LayoutDashboard,path:"/dashboard"},{label:"Opportunities",icon:Briefcase,path:"/jobs"},{label:"My applications",icon:GitBranch,path:"/applications"},{label:"My assessments",icon:FileText,path:"/assessments"}];
 function item(label:string,Icon:typeof User,href:string,exact=false){const active=exact?pathname===href:pathname===href||pathname.startsWith(href+"/");return <Link key={href} href={href} onClick={()=>setOpen(false)} aria-current={active?"page":undefined} className={"workspace-nav-link "+(active?"active":"")}><Icon size={16} strokeWidth={1.7}/><span>{label}</span>{active&&<motion.i layoutId="workspace-active-indicator" transition={{type:"spring",stiffness:420,damping:34}}/>}</Link>;}
 return <><button type="button" aria-label={open?"Close navigation":"Open navigation"} aria-expanded={open} onClick={()=>setOpen(!open)} className="workspace-menu-button lg:hidden">{open?<X size={19}/>:<Menu size={19}/>}</button>{open&&<button className="fixed inset-0 z-40 bg-ink/30 lg:hidden" aria-label="Close navigation overlay" onClick={()=>setOpen(false)}/>}<aside className={"workspace-sidebar "+(open?"is-open":"")}><div className="workspace-sidebar-brand"><Brand href={root+(role==="recruiter"?"/jobs":"/dashboard")}/></div><nav aria-label={role+" navigation"}><p className="workspace-nav-group">Workspace</p>{main.map(link=>item(link.label,link.icon,root+link.path))}</nav><footer>{item("Notifications",Bell,root+"/notifications")}{item("Profile",User,root+"/profile")}{item("Settings",Settings,root+"/settings")}<button type="button" onClick={()=>{dispatch(logout());router.push("/auth/"+role+"/login");}}><LogOut size={16}/>Sign out</button></footer></aside></>;
}
