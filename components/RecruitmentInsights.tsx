"use client";
import CustomSelect from "@/components/CustomSelect";

import {useEffect,useMemo,useState} from "react";
import dynamic from "next/dynamic";
import {RefreshCw,ArrowUpRight,Globe2,MapPin,X} from "lucide-react";
import Link from "next/link";
import {useAppDispatch,useAppSelector} from "@/lib/store/hooks";
import {fetchCandidates} from "@/lib/store/features/candidateSlice";

import {fetchScreeningHistory} from "@/lib/store/features/screeningSlice";
import {buildRecruitmentAnalytics} from "@/lib/recruitmentAnalytics";
const ChartLoading=()=> <div className="screeno-chart-empty" role="status">Preparing chart…</div>;
const ActivityChart=dynamic(()=>import("./RecruitmentCharts").then(module=>module.ActivityChart),{ssr:false,loading:ChartLoading});
const ShortlistChart=dynamic(()=>import("./RecruitmentCharts").then(module=>module.ShortlistChart),{ssr:false,loading:ChartLoading});
const WorldMap=dynamic(()=>import("./RecruitmentWorldMap"),{ssr:false,loading:()=> <div className="screeno-chart-empty" role="status">Preparing map…</div>});
export default function RecruitmentInsights({standalone=true,rangeValue,onRangeChange,hideHeading=false}:{standalone?:boolean;rangeValue?:number;onRangeChange?:(value:number)=>void;hideHeading?:boolean}){
 const dispatch=useAppDispatch(),candidateState=useAppSelector(state=>state.candidate),screeningState=useAppSelector(state=>state.screening);
 const [localRange,setLocalRange]=useState(30),[selected,setSelected]=useState<string|null>(null);
 const range=rangeValue??localRange,setRange=onRangeChange??setLocalRange;
 const loading=candidateState.loading||screeningState.loading;
 const error=candidateState.error||screeningState.error;
 useEffect(()=>{if(standalone){void dispatch(fetchCandidates());void dispatch(fetchScreeningHistory("all"));}},[dispatch,standalone]);
 const data=useMemo(()=>buildRecruitmentAnalytics(candidateState.candidates,screeningState.history,range),[candidateState.candidates,screeningState.history,range]);
 const active=data.countries.find(country=>country.name===selected);
 function selectCountry(name:string){setSelected(value=>value===name?null:name);}
 function refresh(){setSelected(null);void dispatch(fetchCandidates());void dispatch(fetchScreeningHistory("all"));}
 return <section className="screeno-insights" aria-label="Recruitment analytics">
  {!hideHeading&&<header className="screeno-insights-heading"><div><p>YOUR REPORTS</p><h2>{standalone?"Hiring analytics":"Your hiring activity"}</h2><span>Activity uses your selected dates. The map and shortlist include all applicants.</span></div><div className="screeno-insights-actions"><label className="sr-only" htmlFor="insights-range">Activity date range</label><CustomSelect id="insights-range" value={range} onChange={event=>setRange(Number(event.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></CustomSelect>{standalone?<button type="button" onClick={refresh} disabled={loading} aria-label="Refresh analytics"><RefreshCw size={15} className={loading?"animate-spin":""}/></button>:<Link href="/recruiter/analytics">View analytics <ArrowUpRight size={13}/></Link>}</div></header>}
  {error&&<p className="screeno-insights-warning" role="alert">Some records could not be loaded. Charts may be incomplete. {error}<button type="button" onClick={refresh}>Try again</button></p>}
  <div className="screeno-analytics-grid">
   <article className="screeno-analytics-card activity-card"><header><div><h3>Applicant activity</h3><p>New records over the last {range} days · Africa/Johannesburg</p></div><strong>{data.newCandidates}<small>new applicants</small></strong></header>{loading&&!data.total?<ChartLoading/>:<ActivityChart data={data.daily}/>}<div className="screeno-activity-summary"><span><b>{data.sessions}</b>screening sessions in period</span><span><b>{data.total}</b>applicants in your workspace</span></div>{data.undated>0&&<p className="screeno-data-note">{data.undated} records with no valid date are excluded from the activity chart.</p>}<details className="screeno-chart-data"><summary>View activity data</summary><div>{data.daily.map(day=><p key={day.date}><span>{day.date}</span><b>{day.count}</b></p>)}</div></details></article>
   <article className="screeno-analytics-card donut-card"><header><div><h3>Shortlist coverage</h3><p>Each applicant is counted once across your screenings</p></div></header><ShortlistChart shortlisted={data.shortlisted} other={data.other}/><div className="screeno-chart-legend"><p><i className="legend-blue"/>Shortlisted<strong>{data.shortlisted}</strong></p><p><i className="legend-lime"/>Other applicants<strong>{data.other}</strong></p></div></article>
   <article className="screeno-analytics-card distribution-card"><header><div><h3>Country distribution</h3><p>Top {Math.min(data.countries.length,standalone?8:5)} of {data.countries.length} countries · {data.total-data.unmapped} applicants mapped</p></div><Globe2 size={16}/></header><div className="screeno-country-list">{data.countries.length?data.countries.slice(0,standalone?8:5).map(country=><button type="button" key={country.name} onClick={()=>selectCountry(country.name)} aria-pressed={selected===country.name}><span>{country.name}<small>{data.total?Math.round(country.count/data.total*100):0}% of applicants</small></span><strong>{country.count}</strong><i><b style={{width:(data.total?country.count/data.total*100:0)+"%"}}/></i></button>):<p className="screeno-data-note">Add applicants with a country to see this breakdown.</p>}</div>{data.unmapped>0&&<p className="screeno-data-note">Remote and unknown locations are included in the total but not plotted.</p>}</article>
   <article className="screeno-analytics-card geography-card"><header><div><h3>Applicant geography</h3><p>Select a country bubble or a distribution row</p></div><MapPin size={16}/></header><WorldMap countries={data.countries} selected={selected} onSelect={selectCountry}/><div className="screeno-map-detail">{active?<><div><strong>{active.name}</strong><span>{active.count} applicant records</span><button type="button" aria-label="Clear country selection" onClick={()=>setSelected(null)}><X size={13}/></button></div><ul>{active.locations.map(location=><li key={location.name}><span>{location.name}</span><b>{location.count}</b></li>)}</ul></>:<p>Markers show the approximate country, based on applicant profiles.</p>}</div></article>
  </div>
 </section>;
}
