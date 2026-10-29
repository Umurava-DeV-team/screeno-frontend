"use client";
import Link from "next/link";
import {Plus,Upload,Mail} from "lucide-react";
import {useEffect,useState} from "react";
import {useAppDispatch,useAppSelector} from "@/lib/store/hooks";
import {fetchCandidates,type ApiCandidate} from "@/lib/store/features/candidateSlice";
import DataTable,{type Column} from "@/components/DataTable";
import CandidateDetailsPanel from "@/components/CandidateDetailsPanel";
import CreateCandidateModal from "@/components/modals/CreateCandidateModal";
import EditCandidateModal from "@/components/modals/EditCandidateModal";
import DeleteCandidateModal from "@/components/modals/DeleteCandidateModal";
import CandidateViewModal from "@/components/modals/CandidateViewModal";
export default function RecruiterCandidatesPage(){
 const dispatch=useAppDispatch(),{candidates,loading,error}=useAppSelector(state=>state.candidate);
 const [selectedId,setSelectedId]=useState<string|null>(null),[modal,setModal]=useState<"create"|"view"|"edit"|"delete"|null>(null);
 const active=candidates.find(person=>person._id===selectedId)||candidates[0];
 useEffect(()=>{void dispatch(fetchCandidates());},[dispatch]);
 function selectPerson(person:ApiCandidate){setSelectedId(person._id);if(window.matchMedia("(max-width:900px)").matches)requestAnimationFrame(()=>document.querySelector(".screeno-person-detail")?.scrollIntoView({block:"start",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"}));}
 function open(person:ApiCandidate,mode:"view"|"edit"|"delete"){setSelectedId(person._id);setModal(mode);}
 const columns:Column<ApiCandidate>[]=[
 {header:"Name",accessor:person=><div className="screeno-applicant-cell"><span>{person.name.split(" ").map(part=>part[0]).slice(0,2).join("")}</span><div><strong>{person.name}</strong><small><Mail size={11}/>{person.email}</small></div></div>},
 {header:"Role",accessor:person=>person.currentRole||"Not provided"},
 {header:"Location",accessor:person=>person.location||"Not provided"},
 {header:"Skills",accessor:person=><div className="screeno-table-skills">{person.skills.slice(0,2).map(skill=><span key={skill}>{skill}</span>)}</div>},
 {header:"Job",accessor:person=>person.jobApplied||"Talent pool"}
 ];
 return <div className="screeno-candidates-page"><header className="screeno-page-title"><div><p>YOUR PEOPLE</p><h1>Applicant database</h1><span>Review profiles, manage records, and find the right people for each role.</span></div><div><Link href="/recruiter/candidates/upload" className="screeno-outline-button"><Upload size={14}/>Import applicants</Link><button type="button" className="screeno-soft-button" onClick={()=>setModal("create")}><Plus size={15}/>Add applicant</button></div></header>
 {error&&<p role="alert" className="screeno-inline-error">{error}<button onClick={()=>dispatch(fetchCandidates())}>Try again</button></p>}
 <div className="screeno-candidate-database"><DataTable<ApiCandidate> title="All applicants" columns={columns} data={candidates} rowKey="_id" selectedRowKey={active?._id} onRowSelect={selectPerson} onView={person=>open(person,"view")} onEdit={person=>open(person,"edit")} onDelete={person=>open(person,"delete")} searchPlaceholder={loading?"Loading applicants…":"Search by name, role or location…"}/><CandidateDetailsPanel candidate={active} onView={()=>active&&open(active,"view")} onEdit={()=>active&&open(active,"edit")}/></div>
 <CreateCandidateModal isOpen={modal==="create"} onClose={()=>setModal(null)} onSuccess={()=>{setModal(null);void dispatch(fetchCandidates());}}/>
 <CandidateViewModal isOpen={modal==="view"} onClose={()=>setModal(null)} candidate={active||null}/>
 <EditCandidateModal isOpen={modal==="edit"} onClose={()=>setModal(null)} onSuccess={()=>{setModal(null);void dispatch(fetchCandidates());}} candidate={active||null}/>
 <DeleteCandidateModal isOpen={modal==="delete"} onClose={()=>setModal(null)} onConfirm={()=>setModal(null)} candidateId={active?._id||""} candidateName={active?.name||""}/>
 </div>;
}