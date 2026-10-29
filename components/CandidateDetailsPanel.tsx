"use client";
import {Mail,Phone,MapPin,FileText,UserRound,ArrowUpRight} from "lucide-react";
import type {ApiCandidate} from "@/lib/store/features/candidateSlice";
export default function CandidateDetailsPanel({candidate,onEdit,onView}:{candidate:ApiCandidate|undefined;onEdit:()=>void;onView:()=>void}){
 if(!candidate)return <aside className="screeno-person-detail"><UserRound size={32}/><h3>Select an applicant</h3><p>Choose a record to see their profile here.</p></aside>;
 return <aside className="screeno-person-detail" aria-label="Selected applicant details" aria-live="polite">
 <span className="screeno-detail-kicker">APPLICANT PROFILE</span><div className="screeno-person-avatar">{candidate.name.split(" ").map(part=>part[0]).slice(0,2).join("")}</div><h2>{candidate.name}</h2><p>{candidate.currentRole||"Role not provided"}</p>
 <div className="screeno-person-contact"><a href={"mailto:"+candidate.email} aria-label={"Email "+candidate.name}><Mail size={16}/></a>{candidate.phone&&<a href={"tel:"+candidate.phone} aria-label={"Call "+candidate.name}><Phone size={16}/></a>}<button type="button" onClick={onView} aria-label="Open full applicant profile"><ArrowUpRight size={16}/></button></div>
 <section><h3>About</h3><p>{candidate.summary||"No summary added yet."}</p></section>
 <dl><div><dt>Location</dt><dd><MapPin size={13}/>{candidate.location||"Not provided"}</dd></div><div><dt>Experience</dt><dd>{candidate.experience||"Not provided"}</dd></div><div><dt>Education</dt><dd>{candidate.education||"Not provided"}</dd></div><div><dt>Applied for</dt><dd>{candidate.jobApplied||"Talent pool"}</dd></div></dl>
 <section><h3>Skills</h3><div className="screeno-detail-skills">{candidate.skills.length?candidate.skills.map(skill=><span key={skill}>{skill}</span>):<p>No skills added yet.</p>}</div></section>
 <section><h3>Contact</h3><p className="screeno-detail-email">{candidate.email}</p></section>
 <button type="button" className="screeno-detail-action" onClick={onView}><FileText size={15}/>View full profile</button><button type="button" className="screeno-detail-edit" onClick={onEdit}>Edit applicant</button>
 </aside>;
}