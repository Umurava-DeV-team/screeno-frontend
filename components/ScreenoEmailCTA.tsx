"use client";
import {useId,useState} from "react";
import {ArrowUpRight,UserRound,Check} from "lucide-react";
export default function ScreenoEmailCTA(){
  const id=useId();
  const [ready,setReady]=useState(false);
  return <div className="screeno-email-entry">
    <form className="screeno-email-form" onSubmit={event=>{event.preventDefault();event.currentTarget.reset();setReady(true);}}>
      <label htmlFor={id} className="sr-only">Email address</label>
      <span className="screeno-email-field"><UserRound size={17} aria-hidden="true"/>
        <input id={id} type="email" required autoComplete="email" maxLength={254} placeholder="Enter your email" aria-describedby={id+"-note"}/>
      </span>
      <button type="submit">Try now <ArrowUpRight size={14}/></button>
    </form>
    <p id={id+"-note"} className="screeno-email-note">Try the demo. We do not save your email or send a message.</p>
    <p role="status" className="screeno-email-status">{ready&&<><Check size={13}/>Open the recruiter demo below to start exploring.</>}</p>
  </div>;
}
