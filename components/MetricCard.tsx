"use client";
import type {LucideIcon} from "lucide-react";
import {ArrowUpRight} from "lucide-react";
import Link from "next/link";
export default function MetricCard({label,value,trend,icon:Icon,className="",hint,href,hrefLabel="View Details"}:{label:string;value:string;trend?:string;icon:LucideIcon;className?:string;hint?:string;href?:string;hrefLabel?:string}){
 return <div className={"screeno-links-metric "+className}>
  <Icon className="screeno-links-metric-icon" size={36} strokeWidth={1.5} aria-hidden="true"/>
  <div className="screeno-links-metric-copy"><p>{label}</p><div><strong>{value}</strong>{trend&&<span>{trend}</span>}</div>{hint&&<p className="screeno-links-metric-hint">{hint}</p>}{href&&<Link href={href} aria-label={"View "+label.toLowerCase()}>{hrefLabel}<ArrowUpRight size={14}/></Link>}</div>
 </div>;
}
