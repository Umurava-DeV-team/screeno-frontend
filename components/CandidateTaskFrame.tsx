"use client";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {ArrowLeft,BookOpen,ClipboardCheck,MessageSquare} from "lucide-react";
export default function CandidateTaskFrame({children}:{children:React.ReactNode}){
 const path=usePathname();if(path==="/candidate/assessments")return <>{children}</>;
 return <div className="candidate-assessment-workbench"><Link className="studio-back" href="/candidate/assessments"><ArrowLeft size={14}/>My assessments</Link><section className="candidate-assessment-process" aria-label="Assessment process"><span><BookOpen size={17}/>Read the instructions</span><i/><span><ClipboardCheck size={17}/>Complete & submit</span><i/><span><MessageSquare size={17}/>Review feedback</span></section>{children}</div>;
}