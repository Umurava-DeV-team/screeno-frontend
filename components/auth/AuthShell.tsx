"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import ScreenoMark from "../ScreenoMark";

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M5.3 14.3l-.8.6-2.7 2.1C3.5 20.1 7.4 22.5 12 22.5c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 1-3.6 1-2.8 0-5.1-1.9-6-4.4z"
      />
      <path
        fill="#4A90E2"
        d="M3.2 7.1C2.4 8.7 2 10.3 2 12s.4 3.3 1.2 4.9c0 .1 3.5-2.7 3.5-2.7-.2-.6-.3-1.2-.3-2.2s.1-1.6.3-2.2L3.2 7.1z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.3c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.3 14.7 1.5 12 1.5 7.4 1.5 3.5 3.9 1.8 7.1l3.5 2.7c.8-2.5 3.2-4.5 6.7-4.5z"
      />
    </svg>
  );
}

type AuthMode = "login" | "signup" | "forgot" | "reset" | "verify";

type AuthShellProps = {
  mode: AuthMode;
  children: React.ReactNode;
  onGoogle?: () => void;
  googleLoading?: boolean;
};

const COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  login: { title: "Welcome back", subtitle: "Sign in to manage applicants and keep your hiring moving." },
  signup: { title: "Create your account", subtitle: "Bring your hiring team and applicants into one workspace." },
  forgot: { title: "Reset password", subtitle: "Enter your email and we’ll send you a 6-digit code." },
  reset: { title: "Choose a new password", subtitle: "Choose a strong password for your account." },
  verify: { title: "Verify your email", subtitle: "Confirming your address keeps your account secure." },
};

/** Split-screen auth — fits one viewport; brand visual on the right. */
export function AuthShell({ mode, children, onGoogle, googleLoading }: AuthShellProps) {
  const { title, subtitle } = COPY[mode];

  return (
    <div data-auth-mode={mode} className="auth-page relative min-h-[100svh] overflow-x-hidden overflow-y-auto bg-[#f3f4f2] font-[family-name:var(--font-sans)] text-[#0a0a0a] lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "url('/marketing/auth-pattern.svg')",
          backgroundSize: "96px 96px",
        }}
      />

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col lg:h-full lg:min-h-0 lg:flex-row lg:items-stretch lg:gap-4 lg:p-4">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`auth-shell-form flex min-h-[100svh] flex-1 flex-col justify-center px-5 py-8 sm:px-8 lg:min-h-0 lg:overflow-hidden lg:px-12 ${mode === "signup" ? "lg:justify-start lg:py-2" : "lg:py-4"}`}
        >
          <Link href="/" className={`mb-4 inline-flex shrink-0 items-center gap-2 self-start ${mode === "signup" ? "sm:mb-2 lg:mb-1" : "sm:mb-5"}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b1ff43] text-[#0a0a0a]">
              <ScreenoMark size={25} />
            </span>
            <span className="text-[16px] font-bold tracking-tight">Screeno</span>
          </Link>

          <h1 className="text-[clamp(1.45rem,2.6vw,1.85rem)] font-bold leading-[1.1] tracking-[-0.03em]">
            {title}
          </h1>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-[#525252]">{subtitle}</p>

          {(mode === "login" || mode === "signup") && onGoogle ? (
            <>
              <button
                type="button"
                onClick={onGoogle}
                disabled={googleLoading}
                className={`flex w-full max-w-md cursor-pointer items-center justify-center gap-2.5 rounded-[5px] border border-black/12 bg-white px-4 text-[13px] font-semibold text-[#0a0a0a] transition hover:border-black/25 hover:bg-zinc-50 disabled:opacity-60 ${mode === "signup" ? "mt-2 py-2" : "mt-4 py-2.5"}`}
              >
                <GoogleIcon className="h-4 w-4" />
                {googleLoading ? "Connecting…" : "Continue with Google"}
              </button>
              <div className={`flex max-w-md items-center gap-3 ${mode === "signup" ? "my-2" : "my-3.5"}`}>
                <span className="h-px flex-1 bg-black/10" />
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#737373]">
                  or email
                </span>
                <span className="h-px flex-1 bg-black/10" />
              </div>
            </>
          ) : (
            <div className="mt-4" />
          )}

          <div className="w-full max-w-md">{children}</div>


        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden h-full min-h-0 flex-1 overflow-hidden rounded-[12px] bg-[#0a0a0a] lg:flex lg:flex-col"
        >
          <Image
            src="/marketing/auth-hero.webp"
            alt="Portfolio previews on mobile devices"
            fill
            priority
            className="object-cover object-center"
            sizes="(min-width: 1024px) 50vw, 0px"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/75 via-[#0a0a0a]/20 to-[#0a0a0a]/5"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 top-6 h-40 w-40 rounded-full bg-[#b1ff43]/25 blur-[70px]"
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b1ff43]">
                Screeno
              </p>
              <h2 className="mt-3 max-w-sm text-[clamp(1.35rem,2vw,1.75rem)] font-bold leading-[1.15] tracking-[-0.03em] text-white">
                One workspace for{" "}
                <em
                  className="font-normal italic text-[#b1ff43]"
                  style={{ fontFamily: "inherit" }}
                >
                  every hiring step
                </em>
              </h2>
              <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-zinc-300">
                Applicants · work samples · team feedback · clear next steps.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
              {[
                { t: "Applicants", d: "One shared view" },
                { t: "Work samples", d: "Skills in context" },
                { t: "Your team", d: "Human decisions" },
              ].map((item) => (
                <div key={item.t}>
                  <p className="text-[11px] font-semibold text-white">{item.t}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-400">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

export { GoogleIcon };
