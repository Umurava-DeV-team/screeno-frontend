"use client";
import { useState } from "react";
import { Asterisk, Pause, Play } from "lucide-react";
const capabilities = [
  "Hire based on skills",
  "Job-related tasks",
  "People make the decisions",
  "Clear application updates",
  "Keep your team on the same page",
  "Review skills together",
];
export default function CapabilityMarquee({ variant = "standard" }: { variant?: "standard" | "footer" }) {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className={"ts-capability-band ts-capability-marquee" + (variant === "footer" ? " screeno-footer-marquee" : "")}
      role="region"
      aria-label={variant === "footer" ? "Screeno footer highlights" : "Screeno capabilities"}
      data-paused={paused}
    >
      {variant !== "footer" && <div className="screeno-marquee-backing" aria-hidden="true" />}
      <div className="ts-marquee-viewport">
        <div className="ts-marquee-track">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className="ts-marquee-group"
              aria-hidden={copy === 1 ? true : undefined}
            >
              {capabilities.map((text) => (
                <li key={text}>
                  <span>{text}</span>
                  <Asterisk size={23} aria-hidden="true" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="ts-marquee-toggle"
        aria-label={
          paused ? "Resume " + variant + " capability marquee" : "Pause " + variant + " capability marquee"
        }
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? (
          <Play size={13} aria-hidden="true" />
        ) : (
          <Pause size={13} aria-hidden="true" />
        )}
        <span>{paused ? "Play" : "Pause"}</span>
      </button>
    </div>
  );
}
