import countryNames from "./geo/country-names.json";
type Candidate={_id:string;location?:string;createdAt?:string};
type Screening={screenedAt?:string;shortlist:{candidateId:string;matchScore?:number}[]};
export type CountryTotal={name:string;count:number;locations:{name:string;count:number}[]};
const normal=(value:string)=>value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim();
const countries=new Map(countryNames.map(name=>[normal(name),name]));
const aliases:Record<string,string>={usa:"United States of America",us:"United States of America","united states":"United States of America",uk:"United Kingdom","great britain":"United Kingdom","south korea":"South Korea","ivory coast":"Côte d'Ivoire",drc:"Dem. Rep. Congo"};
const cities:Record<string,string>={kigali:"Rwanda",nairobi:"Kenya",kampala:"Uganda",lagos:"Nigeria",abuja:"Nigeria",accra:"Ghana",johannesburg:"South Africa","cape town":"South Africa",pretoria:"South Africa",london:"United Kingdom",toronto:"Canada",vancouver:"Canada",mumbai:"India",delhi:"India",bangalore:"India",berlin:"Germany",paris:"France",sydney:"Australia",melbourne:"Australia"};
export function resolveApplicantCountry(location:string){
 const tokens=location.split(/[,;/]+/).map(normal).filter(Boolean);
 for(const token of tokens){const name=countries.get(token)||aliases[token];if(name&&countries.has(normal(name)))return countries.get(normal(name))!;}
 for(const token of tokens){const name=cities[token];if(name&&countries.has(normal(name)))return countries.get(normal(name))!;}
 return null;
}
export function applicantDay(value:Date|string){
 const date=value instanceof Date?value:new Date(value);
 if(!Number.isFinite(date.getTime()))return null;
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Johannesburg",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
 return ["year","month","day"].map(type=>parts.find(part=>part.type===type)!.value).join("-");
}
export function buildRecruitmentAnalytics(candidates:Candidate[],history:Screening[],range:number,now=new Date()){
 const days=[7,30,90].includes(range)?range:30;
 const today=applicantDay(now)!;
 const end=Date.parse(today+"T00:00:00Z");
 const daily=Array.from({length:days},(_,index)=>({date:new Date(end-(days-1-index)*86400000).toISOString().slice(0,10),count:0}));
 const byDay=new Map(daily.map(item=>[item.date,item]));
 let undated=0;
 for(const candidate of candidates){const key=candidate.createdAt?applicantDay(candidate.createdAt):null;if(!key){undated++;continue;}const bucket=byDay.get(key);if(bucket)bucket.count++;}
 const sessions=history.filter(item=>{const day=item.screenedAt?applicantDay(item.screenedAt):null;return !!day&&byDay.has(day);});
 const ids=new Set(candidates.map(item=>item._id));
 const shortlistIds=new Set(history.flatMap(item=>item.shortlist.map(person=>person.candidateId)).filter(id=>ids.has(id)));
 const countryGroups=new Map<string,Map<string,number>>();
 let unmapped=0;
 for(const candidate of candidates){const country=resolveApplicantCountry(candidate.location||"");if(!country){unmapped++;continue;}const locations=countryGroups.get(country)||new Map<string,number>();const raw=candidate.location?.trim()||country;locations.set(raw,(locations.get(raw)||0)+1);countryGroups.set(country,locations);}
 const countryTotals:CountryTotal[]=[...countryGroups].map(([name,locations])=>({name,count:[...locations.values()].reduce((a,b)=>a+b,0),locations:[...locations].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count)})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
 return {daily,undated,sessions: sessions.length,newCandidates:daily.reduce((sum,item)=>sum+item.count,0),countries:countryTotals,unmapped,total:candidates.length,shortlisted:shortlistIds.size,other:candidates.length-shortlistIds.size};
}

export function groupApplicantDays(days:{date:string;count:number}[]){
 const size=days.length<=14?1:Math.ceil(days.length/8);
 const points=Array.from({length:Math.ceil(days.length/size)},(_,index)=>{
  const records=days.slice(index*size,(index+1)*size);
  return {startDate:records[0].date,endDate:records[records.length-1].date,count:records.reduce((sum,day)=>sum+day.count,0)};
 });
 return {size,points};
}