"use client";
import { useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Target, FileInput, SearchCheck, FlaskConical, MessagesSquare, Flag, BriefcaseBusiness, UserRound, Send, Route, ShieldCheck } from "lucide-react";
const flows = {
    recruiter: { name: "For hiring teams", action: "Try the hiring team demo", href: "/auth/recruiter/login", steps: [
            { icon: Target, title: "Describe the job", text: "Explain the job and the skills you need." },
            { icon: FileInput, title: "Collect applications", text: "Keep applications and shared work in one place." },
            { icon: SearchCheck, title: "Check skills and experience", text: "Read each application, check the work, and ask questions." },
            { icon: FlaskConical, title: "Set a job task", text: "Give people a task and use the same review guidelines." },
            { icon: MessagesSquare, title: "Review with your team", text: "Share notes and record why you chose the next step." },
            { icon: Flag, title: "Keep applicants updated", text: "Choose what happens next and let the person know." }
        ] },
    candidate: { name: "Review as a team", action: "Try the recruiter demo", href: "/auth/recruiter/login", steps: [
            { icon: BriefcaseBusiness, title: "Set review guidelines", text: "Agree on the skills and experience your team will review." },
            { icon: UserRound, title: "Add your reviewers", text: "Give each reviewer a clear part in the hiring process." },
            { icon: Send, title: "Review submitted work", text: "Read applications and review job tasks using shared guidelines." },
            { icon: FlaskConical, title: "Compare team feedback", text: "Bring scores and notes together before deciding." },
            { icon: Route, title: "Discuss open questions", text: "Ask for missing details and resolve questions as a team." },
            { icon: ShieldCheck, title: "Record your decision", text: "Choose the next step and keep a record of your reasons." }
        ] }
};
export default function ScreenoJourney() {
    const [audience, setAudience] = useState<"recruiter" | "candidate">("recruiter");
    const id = useId();
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const flow = flows[audience];
  return (
    <div className="screeno-process screeno-infographic">
      <div className="screeno-audience-tabs" role="tablist" aria-label="Explore recruiter workflows">
        {(["recruiter", "candidate"] as const).map((role, index) => (
          <button
            ref={(node) => { tabs.current[index] = node; }}
            key={role}
            id={id + "-" + role}
            role="tab"
            aria-selected={audience === role}
            aria-controls={id + "-panel"}
            tabIndex={audience === role ? 0 : -1}
            type="button"
            onClick={() => setAudience(role)}
            onKeyDown={(event) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                event.preventDefault();
                const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : index === 0 ? 1 : 0;
                setAudience(next === 0 ? "recruiter" : "candidate");
                tabs.current[next]?.focus();
              }
            }}
          >
            {role === "recruiter" ? "Manage hiring" : "Review as a team"}
          </button>
        ))}
      </div>
      <div
        id={id + "-panel"}
        role="tabpanel"
        aria-labelledby={id + "-" + audience}
        tabIndex={0}
        className="screeno-timeline-panel"
      >
        <p className="screeno-timeline-caption">
          {flow.name}
          <span>Six steps to help you get started.</span>
        </p>
        <div className="screeno-timeline">
          <span className="screeno-timeline-spine" aria-hidden="true" />
          <ol>
            {flow.steps.map((step, index) => (
              <li
                key={step.title}
                className={"screeno-timeline-entry " + (index % 2 === 0 ? "is-left" : "is-right")}
              >
                <span className="screeno-timeline-node" aria-hidden="true">{index + 1}</span>
                <div className="screeno-timeline-branch">
                  <span className="screeno-timeline-icon" aria-hidden="true">
                    <step.icon size={23} strokeWidth={1.65} />
                  </span>
                  <div className="screeno-timeline-copy">
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="screeno-timeline-footer">
          <span><Check size={14} />People make the final decision</span>
          <Link href={flow.href} className="ts-button">
            {flow.action}<ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
