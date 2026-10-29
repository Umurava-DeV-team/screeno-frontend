"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CornerDownRight, Menu, X } from "lucide-react";
import Brand from "./Brand";
const links = [
  { label: "Home", href: "/" },
  { label: "Tools", href: "/#services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Workspaces", href: "/#workspaces" },
  { label: "Why Screeno", href: "/#why-screeno" },
  { label: "Questions", href: "/#questions" },
];
export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <header
      className="ts-site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <div className="ts-site-nav">
        <Brand />
        <nav aria-label="Main navigation" className="ts-site-nav-group">
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={index === 0 ? "is-home" : ""}
            >
              <CornerDownRight size={12} aria-hidden="true" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ts-site-nav-actions">
          <Link href="/auth" className="ts-site-nav-cta">
            Get started <ArrowUpRight size={14} />
          </Link>
          <button
            type="button"
            className="ts-site-menu-trigger"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <nav
            id={id}
            aria-label="Mobile navigation"
            className="ts-site-mobile-nav"
          >
            {links.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
              >
                <CornerDownRight size={13} />
                {link.label}
              </Link>
            ))}
            <Link href="/auth" onClick={() => setOpen(false)}>
              Get started <ArrowUpRight size={14} />
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
