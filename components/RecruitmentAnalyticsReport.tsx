"use client";
import {useEffect,useMemo,useState} from "react";
import {Users,Target,Briefcase,ShieldCheck,RefreshCw} from "lucide-react";
import {useAppDispatch,useAppSelector} from "@/lib/store/hooks";
import {fetchJobs} from "@/lib/store/features/jobsSlice";
import {fetchCandidates} from "@/lib/store/features/candidateSlice";
import {fetchScreeningHistory} from "@/lib/store/features/screeningSlice";
import {buildRecruitmentAnalytics} from "@/lib/recruitmentAnalytics";
import CustomSelect from "./CustomSelect";
import ExportMenu from "./ExportMenu";
import MetricCard from "./MetricCard";
import RecruitmentInsights from "./RecruitmentInsights";
import DataTable from "./DataTable";
export default function RecruitmentAnalyticsReport(){
 const dispatch=useAppDispatch(),{jobs}=useAppSelector(state=>state.jobs),{candidates}=useAppSelector(state=>state.candidate),{history}=useAppSelector(state=>state.screening);
 const [range,setRange]=useState(30),[status,setStatus]=useState("all");
 useEffect(()=>{void dispatch(fetchJobs());},[dispatch]);
 const data=useMemo(()=>buildRecruitmentAnalytics(candidates,history,range),[candidates,history,range]),calendar=useMemo(()=>buildRecruitmentAnalytics(candidates,history,90).daily,[candidates,history]);
 const roleRows=jobs.filter(job=>status==="all"||job.status===status).map(job=>{const applicants=candidates.filter(person=>person.jobId===job._id),ids=new Set(applicants.map(person=>person._id)),shortlist=new Set(history.filter(session=>session.jobId===job._id).flatMap(session=>session.shortlist.map(person=>person.candidateId)).filter(id=>ids.has(id)));return {id:job._id,title:job.title,status:job.status||"Not set",applicants:applicants.length,shortlisted:shortlist.size,sessions:history.filter(session=>session.jobId===job._id).length};});
 const padding=(new Date(calendar[0].date+"T12:00:00Z").getUTCDay()+6)%7;
 function refresh(){void dispatch(fetchJobs());void dispatch(fetchCandidates());void dispatch(fetchScreeningHistory("all"));}
 return <div className="screeno-analytics-report"><header className="screeno-page-title"><div><p>YOUR HIRING REPORT</p><h1>Analytics overview</h1><span>Understand applicant activity and how each role is progressing.</span></div><div><CustomSelect aria-label="Report date range" value={range} onChange={event=>setRange(Number(event.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></CustomSelect><button type="button" className="screeno-outline-button" aria-label="Refresh report" onClick={refresh}><RefreshCw size={14}/></button><ExportMenu report={{title:"Applicant activity report",subtitle:"Last "+range+" days. Dates use Africa/Johannesburg.",columns:["Date","New applicants"],rows:data.daily.map(day=>[day.date,day.count])}}/></div></header>
 <div className="screeno-metric-rail"><MetricCard label="Applicants" value={String(data.total)} icon={Users}/><MetricCard label="Shortlisted" value={String(data.shortlisted)} icon={Target}/><MetricCard label="Open roles" value={String(jobs.filter(job=>job.status==="active").length)} icon={Briefcase}/><MetricCard label="Screening sessions" value={String(history.length)} icon={ShieldCheck}/></div>
 <RecruitmentInsights rangeValue={range} onRangeChange={setRange} hideHeading/>
 <section className="screeno-calendar-panel"><header><div><h2>Applicant activity calendar</h2><p>New applicant records each day over the last 90 days.</p></div><span>Less <i data-level="0"/><i data-level="1"/><i data-level="2"/><i data-level="3"/> More</span></header><div className="screeno-calendar-scroll"><div className="screeno-calendar-grid">{Array.from({length:padding},(_,index)=><span className="screeno-calendar-padding" key={"pad"+index}/>)}{calendar.map(day=><span key={day.date} role="img" aria-label={day.date+": "+day.count+" new applicants"} title={day.date+": "+day.count+" new applicants"} data-level={day.count===0?0:day.count===1?1:day.count<=3?2:3}/>)}</div></div></section>
 <section className="screeno-role-performance"><header><div><h2>Role performance</h2><p>Applicant and shortlist counts for each job. These figures include all dates.</p></div><CustomSelect aria-label="Role status" value={status} onChange={event=>setStatus(event.target.value)}><option value="all">All roles</option><option value="active">Active roles</option><option value="draft">Draft roles</option><option value="closed">Closed roles</option></CustomSelect></header><DataTable title="Role performance data" data={roleRows} rowKey="id" emptyState={{title:"No roles match this view",description:"Choose another status or add a job to build this report."}} columns={[{header:"Role",accessor:"title"},{header:"Status",accessor:"status"},{header:"Applicants",accessor:"applicants"},{header:"Shortlisted",accessor:"shortlisted"},{header:"Screenings",accessor:"sessions"}]}/></section>
 </div>;
}