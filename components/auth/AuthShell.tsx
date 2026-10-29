"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, KeyRound, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import ScreenoMark from "../ScreenoMark";

type AuthMode = "login" | "signup" | "forgot" | "reset" | "verify";
type AuthShellProps = {
  mode: AuthMode;
  children: ReactNode;
  footer?: ReactNode;
  recovery?: boolean;
  onGoogle?: () => void;
  googleLoading?: boolean;
};

const COPY: Record<AuthMode, { title: string; subtitle: string; visual: string; note: string }> = {
  login: { title: "Welcome back", subtitle: "Your next great hire starts here. Let’s get you signed in.", visual: "Good people.\nGreat beginnings.", note: "A little less admin. A lot more human." },
  signup: { title: "Let’s get started", subtitle: "Create your account and bring your hiring team together.", visual: "Big potential.\nMeet your team.", note: "One place for every step of hiring." },
  forgot: { title: "Forgot your password?", subtitle: "It happens. Enter your email to start a password reset.", visual: "A fresh start.\nJust a step away.", note: "We’ll help you find your way back." },
  verify: { title: "Check your inbox", subtitle: "One small check before you’re on your way.", visual: "Small check.\nBig possibilities.", note: "Your hiring workspace is waiting for you." },
  reset: { title: "A fresh start", subtitle: "Choose a new password to finish resetting your account.", visual: "New password.\nSame great team.", note: "Back to the people and work that matter." },
};

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.01v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.35Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.04.97-3.38.97-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z"/></svg>;
}

function RecoveryDecoration({ mode }: { mode: AuthMode }) {
  const Icon = mode === "verify" ? Mail : mode === "reset" ? ShieldCheck : KeyRound;
  return <div className="auth-recovery-art" aria-hidden="true">
    <span className="auth-art-orbit" /><span className="auth-art-orbit inner" />
    <span className="auth-art-spark"><Sparkles size={15} /></span>
    <span className="auth-art-card"><Icon size={30} strokeWidth={1.5} /></span>
    <span className="auth-art-check"><Check size={13} strokeWidth={3} /></span>
    <span className="auth-art-dot" />
  </div>;
}

export function AuthShell({ mode, children, footer, recovery, onGoogle, googleLoading }: AuthShellProps) {
  const reduced = useReducedMotion();
  const copy = COPY[mode];
  const utility = mode === "forgot" || mode === "verify" || mode === "reset";
  const step = mode === "forgot" ? 0 : mode === "reset" ? 2 : 1;
  return <div className="auth-page" data-auth-mode={mode}>
    <div className="auth-backdrop" aria-hidden="true"><span /><span /><span /></div>
    <motion.main className="auth-split-card" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [.22, 1, .36, 1] }}>
      <aside className="auth-visual">
        <Image src="/marketing/screeno-stickman-auth.webp" alt="A friendly Screeno cartoon character holding a candidate folder" fill priority sizes="(min-width: 900px) 48vw, 0px" className="auth-character-image" />
        <div className="auth-visual-shade" aria-hidden="true" />
        <span className="auth-visual-tag"><span /> People make the difference.</span>
        <div className="auth-visual-caption"><span className="auth-visual-eyebrow">GOOD THINGS START WITH PEOPLE</span><h2>{copy.visual.split("\n").map(line => <span key={line}>{line}</span>)}</h2><p>{copy.note}</p></div>
        <div className="auth-visual-bottom"><span>THE HUMAN SIDE OF HIRING</span><ArrowUpRight size={17} /></div>
      </aside>
      <section className="auth-form-panel" aria-labelledby="auth-heading">
        <div className="auth-shell-form">
          <Link href="/" className="auth-brand" aria-label="Screeno home"><ScreenoMark size={32} /><span>Screeno<span className="auth-brand-dot">.</span></span></Link>
          {utility && <RecoveryDecoration mode={mode} />}
          <header className="auth-heading"><span className="auth-form-eyebrow">{utility ? "LET’S GET YOU BACK IN" : mode === "signup" ? "YOUR TEAM’S NEXT CHAPTER" : "YOUR HIRING WORKSPACE"}</span><h1 id="auth-heading">{copy.title}</h1><p>{copy.subtitle}</p></header>
          {(recovery || mode === "reset") && <ol className="auth-recovery-steps" aria-label="Password recovery progress">{["Email", "Code", "New password"].map((label, index) => <li key={label} data-state={index < step ? "complete" : index === step ? "current" : "pending"} aria-current={index === step ? "step" : undefined}><span>{index < step ? <Check size={11} /> : index + 1}</span>{label}</li>)}</ol>}
          <div className="auth-form-content">{children}</div>
          {onGoogle && <><div className="auth-social-divider"><span />or continue with<span /></div><button type="button" className="auth-google-button" onClick={onGoogle} disabled={googleLoading}><GoogleIcon />{googleLoading ? "Connecting…" : "Continue with Google"}</button></>}
          {footer}
          <p className="auth-form-footnote"><LockKeyhole size={11} /> Made for people. Built for better hiring.</p>
        </div>
      </section>
    </motion.main>
    <span className="auth-outside-note">Screeno · Your team’s next great beginning.</span>
  </div>;
}
