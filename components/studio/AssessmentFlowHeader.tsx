"use client";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {Check,ArrowLeft} from "lucide-react";
export default function AssessmentFlowHeader(){
 const path=usePathname(),phase=path.includes("/new")?0:path.includes("/edit")?1:path.includes("/preview")?2:path.includes("/launch")?3:4;
 return <div className="assessment-flow-header"><Link href="/recruiter/assessments"><ArrowLeft size={14}/>Assessment studio</Link><ol>{["Choose role","Edit questions","Preview","Assign","Review results"].map((label,index)=><li key={label} data-active={phase===index} data-complete={phase>index}><span>{phase>index?<Check size={12}/>:index+1}</span>{label}</li>)}</ol></div>;
}