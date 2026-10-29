import Link from "next/link";
import {
  ArrowUpRight,
  Check,


  X,



} from "lucide-react";
import SectionLabel from "./SectionLabel";
import ScreenoJourney from "./ScreenoJourney";
import ScreenoWorkspaceHub from "./ScreenoWorkspaceHub";
import ScreenoEmailCTA from "./ScreenoEmailCTA";
export function ScreenoProcess() {
  return (
    <section
      id="how-it-works"
      className="ts-site-container ts-section-space screeno-content-section"
    >
      <div className="screeno-section-intro">
        <SectionLabel>How Screeno works</SectionLabel>
        <h2 className="ts-story-title">
          From application
          <br />
          to the next step.
        </h2>
        <p>
          Six simple steps to manage applications and make your next hire.
        </p>
      </div>
      <ScreenoJourney />
    </section>
  );
}
export function ScreenoWorkspaces() {
  return (
    <section id="workspaces" className="ts-site-container ts-section-space screeno-content-section">
      <div className="screeno-section-intro">
        <SectionLabel>Your hiring workspace</SectionLabel>
        <h2 className="ts-story-title">Keep your hiring team<br/><span className="text-brand">on the same page.</span></h2>
        <p>Explore the tools for tracking applicants and reviewing them with your team. Select a feature to learn more.</p>
      </div>
      <ScreenoWorkspaceHub />
      <p className="screeno-preview-note">This demo uses sample information. It does not create real accounts, send emails, or run background checks.</p>
    </section>
  );
}
export function ScreenoDifference() {
 const problems=[
  ["Applications everywhere","CVs and applicant details are spread across files and messages."],
  ["Hard-to-follow reviews","Team feedback and scores are kept in different places."],
  ["Missed updates","Applicants and reviewers are not sure what happens next."],
  ["Decisions without notes","It is hard to look back and understand a hiring decision."]
 ];
 const benefits=[
  ["Every applicant in one place","Keep applications, experience, and shared work together."],
  ["Clear team reviews","Use shared review guidelines and keep feedback with each applicant."],
  ["A clear next step","Track each stage and approve the next action."],
  ["A record you can follow","Keep the reasons behind your team’s decisions."]
 ];
 return <section id="why-screeno" className="ts-site-container ts-section-space screeno-content-section">
  <div className="screeno-section-intro"><SectionLabel>Why Screeno</SectionLabel><h2 className="ts-story-title">From scattered hiring<br/><span className="text-brand">to one clear process.</span></h2><p>Give your team one place to review applicants and plan the next hire.</p></div>
  <div className="screeno-comparison screeno-compare-pair">
   <svg className="screeno-compare-bridge" viewBox="0 0 1000 160" preserveAspectRatio="none" aria-hidden="true"><path d="M230 150V70Q230 20 280 20H720Q770 20 770 70V150"/></svg>
   <span className="screeno-compare-vs" aria-hidden="true">VS</span>
   {[{title:"Hiring with separate tools",label:"The daily busywork",items:problems,good:false},{title:"Hiring with Screeno",label:"A clearer way to work",items:benefits,good:true}].map(card=><article key={card.title} className={"screeno-compare-card "+(card.good?"is-good":"is-friction")}>
    <span className="screeno-compare-emblem" aria-hidden="true">{card.good?<Check size={26}/>:<X size={26}/>}</span>
    <p className="screeno-compare-label">{card.label}</p><h3>{card.title}</h3>
    <ul>{card.items.map(([title,text])=><li key={title}><span className="screeno-compare-status" aria-hidden="true">{card.good?<Check size={14}/>:<X size={14}/>}</span><div><h4>{title}</h4><p>{text}</p></div></li>)}</ul>
   </article>)}
  </div>
  <p className="screeno-comparison-note">An example of the hiring process. Try the demo to explore the tools.</p>
 </section>;
}

export function ScreenoFAQ() {
  return (
    <section
      id="questions"
      className="ts-site-container ts-section-space screeno-content-section"
    >
      <div className="screeno-section-intro">
        <SectionLabel>Common questions</SectionLabel>
        <h2 className="ts-story-title">Before you bring your team on board.</h2>
        <p>
          Answers about hiring reviews, team decisions, and getting ready for a live rollout.
        </p>
      </div>
      <div className="screeno-faq-list">
        {[
  [
    "How does Screeno help us manage a hiring process?",
    "Keep job openings, applications, work samples, reviewer notes, and next steps in one workspace. Your team can see what needs review and what has already been decided."
  ],
  [
    "Can reviewers use the same criteria for each applicant?",
    "Yes. Set review guidelines for a job task so reviewers assess the same skills. Keep each person’s scores and notes alongside the work they reviewed."
  ],
  [
    "Can we review work samples alongside an applicant’s experience?",
    "Yes. Bring application details and submitted work into the review. Your team can ask about missing information before deciding on the next step."
  ],
  [
    "How are hiring decisions recorded?",
    "Keep reviewer feedback, approval actions, and the reasons for a decision together. People on your hiring team make the decisions; the workspace helps keep the record clear."
  ],
  [
    "How does Screeno handle applicant consent and corrections?",
    "The workflow includes permission choices and requests to correct information. Review those requests before using the information or moving ahead with a check."
  ],
  [
    "What should we confirm before using Screeno with real applicants?",
    "This version uses sample data. Before a live rollout, confirm backend authentication, team access rules, data storage and retention, and any email or third-party connections. Do not enter real applicant information in the demo."
  ]
].map(([question, answer]) => (
          <details key={question} className="ts-faq-item group">
            <summary>
              {question}
              <span aria-hidden="true" className="screeno-faq-plus">
                +
              </span>
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
export function ScreenoStart() {
  return (
    <section id="start" className="screeno-next-beginning screeno-content-section">
      <div className="ts-site-container screeno-next-inner">
        <SectionLabel>Get started</SectionLabel>
        <h2 className="ts-story-title">
          Find the right people.<br />
          <span>Build a stronger team.</span>
        </h2>
        <p className="screeno-next-description">
          Review applicants, involve your team, and choose the next step. Try Screeno with sample hiring data.
        </p>
        <ScreenoEmailCTA />
        <div className="screeno-next-actions">
          <Link href="/auth/recruiter/login" className="ts-button lime">
            I’m hiring <ArrowUpRight size={16} />
          </Link>
          <Link href="#how-it-works" className="ts-button screeno-next-secondary">
            See how it works <ArrowUpRight size={16} />
          </Link>
        </div>
        <Link href="#how-it-works" className="screeno-next-tour">
          See how Screeno works <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="screeno-opportunity-tags" aria-hidden="true">
        {["Skills first", "Work samples", "Show your skills", "People decide",
          "New hires", "Know what’s next", "Hiring teams", "Your next hire"].map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </section>
  );
}
