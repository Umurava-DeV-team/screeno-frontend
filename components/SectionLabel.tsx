import type { ReactNode } from "react";
export default function SectionLabel({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={
        "ts-selection-label screeno-section-label " + (light ? "is-light" : "")
      }
    >
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      {children}
    </p>
  );
}
