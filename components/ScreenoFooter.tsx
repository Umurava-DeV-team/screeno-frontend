import Link from "next/link";
import { ArrowUpRight, Globe2, Users, UserRound } from "lucide-react";
import Brand from "./Brand";
import { MotionToggle } from "./LandingMotion";

export default function ScreenoFooter() {
  return (
    <footer className="screeno-footer">
      <div className="ts-site-container screeno-footer-inner">
        <div className="screeno-footer-top">
          <div className="screeno-footer-identity">
            <Brand />
            <p>Built for recruiters.<br />Keep track of every step.</p>
            <nav aria-label="Footer navigation">
              <Link href="#services">The tools</Link>
              <Link href="#workspaces">Workspaces</Link>
              <Link href="#questions">Questions</Link>
            </nav>
          </div>
          <div className="screeno-footer-invitation">
            <h2>Ready to get started?<br /><span>Find the tools you need.</span></h2>
            <div>
              <Link href="/auth" className="ts-button lime">Try Screeno <ArrowUpRight size={14} /></Link>
              <Link href="#how-it-works" className="screeno-footer-text-link">How it works <ArrowUpRight size={14} /></Link>
            </div>
          </div>
        </div>
        <div className="screeno-footer-bottom">
          <p><span aria-hidden="true" />Your team. Your hiring. One place.</p>
          <div className="screeno-footer-audiences">
            <Link href="/auth/recruiter/login"><Users size={13} />Hiring teams</Link>
            <Link href="/auth/recruiter/login"><UserRound size={13} />Team reviews</Link>
            <span><Globe2 size={13} />Works in your browser</span>
            <MotionToggle />
          </div>
        </div>
      </div>

    </footer>
  );
}
