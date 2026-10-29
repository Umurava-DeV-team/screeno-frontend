import Link from "next/link";
import LandingMotion from "@/components/LandingMotion";
import { ArrowUpRight } from "lucide-react";
import ScreenoFooter from "@/components/ScreenoFooter";

import LandingNavbar from "@/components/LandingNavbar";
import LandingEdgeDetails from "@/components/LandingEdgeDetails";
import SectionLabel from "@/components/SectionLabel";
import {
  DecorativeCursors,
  LandingServices,
} from "@/components/LandingSections";
import {
  ScreenoProcess,
  ScreenoWorkspaces,
  ScreenoDifference,
  ScreenoFAQ,
  ScreenoStart,
} from "@/components/ScreenoSections";
export default function HomePage() {
  return (
    <LandingMotion>
      <LandingEdgeDetails />
      <LandingNavbar />
      <main>
        <section aria-labelledby="hero-title" className="ts-landing-hero">
          <DecorativeCursors />
          <div className="relative z-10 mx-auto w-full max-w-[940px]">
            <SectionLabel>Built for recruiters.</SectionLabel>
            <h1 id="hero-title" className="ts-hero-title">
              Find the right{" "}
              <span className="ts-hero-highlight">people</span>.<br />
              Build a stronger team.
            </h1>
            <p className="ts-hero-description">
              Manage applicants, review their skills with your team, and keep every hiring step in one place.
            </p>
            <div
              id="opportunity-search"
              className="mx-auto mt-8 w-full max-w-[570px] scroll-mt-8"
            >
              <div className="screeno-recruiter-hero-actions"><Link href="/auth/recruiter/register" className="ts-button lime">Start hiring <ArrowUpRight size={16}/></Link><Link href="#how-it-works" className="ts-button secondary">See how it works</Link></div>
            </div>
            <p className="mt-7 text-xs text-slate-500">
              Already using Screeno?{" "}
              <Link
                href="/auth/recruiter/login"
                className="ml-1 inline-flex items-center gap-1 font-semibold text-brand hover:text-ink"
              >
                Sign in to your recruiter account <ArrowUpRight size={13} />
              </Link>
            </p>
          </div>
        </section>
        <LandingServices />
        <ScreenoProcess />
        <ScreenoWorkspaces />
        <ScreenoDifference />
        <ScreenoFAQ />
        <ScreenoStart />
      </main>
      <ScreenoFooter />
    </LandingMotion>
  );
}
