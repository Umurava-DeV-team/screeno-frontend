"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Check, KeyRound, Mail, ShieldCheck } from "lucide-react";
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
  accountRole?: "recruiter" | "candidate";
};

const COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  login: { title: "Welcome back", subtitle: "Your next great hire starts here. Let’s get you signed in." },
  signup: { title: "Create your account", subtitle: "A simple start to your next chapter." },
  forgot: { title: "Forgot your password?", subtitle: "It happens. Enter your email to start a password reset." },
  verify: { title: "Check your inbox", subtitle: "One small check before you’re on your way." },
  reset: { title: "A fresh start", subtitle: "Choose a new password to finish resetting your account." },
};

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.01v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.35Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.04.97-3.38.97-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z"/></svg>;
}

function RecoveryDecoration({ mode }: { mode: AuthMode }) {
  const Icon = mode === "verify" ? Mail : mode === "reset" ? ShieldCheck : KeyRound;
  return <span className="auth-recovery-symbol" aria-hidden="true"><Icon size={22} strokeWidth={1.6} /><span /></span>;
}

export function AuthShell({ mode, children, footer, recovery, onGoogle, googleLoading, accountRole = "recruiter" }: AuthShellProps) {
  const reduced = useReducedMotion();
  const copy = { ...COPY[mode], ...(mode === "login" && accountRole === "candidate" ? { subtitle: "Sign in to follow your applications and next steps." } : {}) };
  const utility = mode === "forgot" || mode === "verify" || mode === "reset";
  const step = mode === "forgot" ? 0 : mode === "reset" ? 2 : 1;
  return <div className="auth-page" data-auth-mode={mode}>
    <motion.main className="auth-split-card" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [.22, 1, .36, 1] }}>
      <Link href="/" className="auth-brand" aria-label="Screeno home"><ScreenoMark size={25} /><span>screeno<span className="auth-brand-dot">.</span></span></Link>
      <aside className="auth-visual">
        <div className="auth-illustration"><Image src="/marketing/screeno-auth-editorial.webp" alt="A friendly cartoon character working on a laptop beside a plant" fill priority sizes="(min-width: 850px) 360px, 0px" className="auth-character-image" /></div>
        <p className="auth-illustration-caption">Good hiring starts with people.</p>
        <Link href={`/auth/${accountRole}/${mode === "signup" ? "login" : "register"}`} className="auth-visual-link">{mode === "signup" ? "Already have an account? Sign in" : "Create an account"}</Link>
      </aside>
      <section className="auth-form-panel" aria-labelledby="auth-heading">
        <div className="auth-shell-form">
          <header className="auth-heading">{utility && <RecoveryDecoration mode={mode} />}<h1 id="auth-heading">{copy.title}</h1><p>{copy.subtitle}</p></header>
          {(recovery || mode === "reset") && <ol className="auth-recovery-steps" aria-label="Password recovery progress">{["Email", "Code", "New password"].map((label, index) => <li key={label} data-state={index < step ? "complete" : index === step ? "current" : "pending"} aria-current={index === step ? "step" : undefined}><span>{index < step ? <Check size={11} /> : index + 1}</span>{label}</li>)}</ol>}
          <div className="auth-form-content">{children}</div>
          {onGoogle && <div className="auth-social-row"><span>Or {mode === "signup" ? "sign up" : "sign in"} with</span><button type="button" className="auth-google-button" onClick={onGoogle} disabled={googleLoading} aria-label="Continue with Google"><GoogleIcon />{googleLoading ? "Connecting…" : "Google"}</button></div>}
          {footer}
        </div>
      </section>
    </motion.main>
  </div>;
}
