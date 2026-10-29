import SectionLabel from "./SectionLabel";
import CapabilityMarquee from "./CapabilityMarquee";
import {
  ArrowUpRight,
  ArrowRight,
  SearchCheck,
  MessagesSquare,
  FlaskConical,
} from "lucide-react";
export function DecorativeCursors() {
  return (
    <div aria-hidden="true" className="ts-cursor-decorations">
      {[
        { label: "Hiring team", className: "ts-cursor-team" },
        { label: "Your next hire", className: "ts-cursor-talent" },
      ].map((cursor) => (
        <div
          key={cursor.label}
          className={"ts-decor-cursor " + cursor.className}
        >
          <svg width="30" height="35" viewBox="0 0 30 35" fill="none">
            <path
              d="M4 3L25 20L15 21L10 31L4 3Z"
              fill="currentColor"
              stroke="white"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
          <span>{cursor.label}</span>
        </div>
      ))}
    </div>
  );
}
export function LandingServices() {
  const services = [
    {
      icon: SearchCheck,
      title: "Review real skills",
      description:
        "See what each person can do. Read their experience, check their work, and ask questions.",
      href: "#why-screeno",
      action: "See how reviews work",
      step: "01",
    },
    {
      icon: FlaskConical,
      title: "Simple job tasks",
      description:
        "Give applicants a task based on the job. Explain what you are looking for and review their answers.",
      href: "#how-it-works",
      action: "See how tasks work",
      step: "02",
    },
    {
      icon: MessagesSquare,
      title: "Keep people updated",
      description:
        "Show people where their application stands, what happens next, and how to ask for help.",
      href: "#workspaces",
      action: "Choose your workspace",
      step: "03",
    },
  ];
  return (
    <section id="services" className="ts-services-section">
      <CapabilityMarquee />
      <div className="ts-site-container ts-section-space ts-open-services">
        <svg
          className="ts-service-ribbons"
          viewBox="0 0 1200 480"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            d="M-90 12C22 12-4 320 139 335S251 408 315 430"
            className="ts-ribbon-blue"
          />
          <path
            d="M-80 39C6 36 26 356 150 368S263 391 324 422"
            className="ts-ribbon-lime"
          />
          <circle cx="315" cy="430" r="4" fill="#0649b5" />
          <circle cx="324" cy="422" r="5" fill="#b1ff43" />
        </svg>
        <div className="ts-services-intro">
          <SectionLabel>Tools for hiring</SectionLabel>
          <h2 className="ts-story-title">
            <span className="text-brand">Hire with confidence.</span>
            <br />
            Keep things simple.
          </h2>
          <p>
            Review skills, set job tasks, and keep applicants updated—all in one place.
          </p>
        </div>
        <div className="ts-open-service-grid">
          {services.map((service) => (
            <article key={service.title} className="ts-open-service">
              <div className="ts-service-orbit" aria-hidden="true">
                <span className="ts-orbit-trace" />
                <service.icon size={30} strokeWidth={1.65} />
                <span className="ts-orbit-node" />
              </div>
              <span className="ts-service-step">STEP {service.step}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a href={service.href}>
                {service.action}
                <ArrowRight size={15} />
              </a>
            </article>
          ))}
        </div>
        <div className="ts-services-cta">
          <a href="#workspaces" className="ts-button secondary">
            See the tools <ArrowUpRight size={16} />
          </a>
          <p>Tools that keep your hiring team organised.</p>
        </div>
      </div>
    </section>
  );
}
