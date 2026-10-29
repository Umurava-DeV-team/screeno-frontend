import Link from "next/link";
import ScreenoMark from "./ScreenoMark";
export default function Brand({
  href = "/",
  light = false,
}: {
  href?: string;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        "ts-brand screeno-brand " + (light ? "text-white" : "text-ink")
      }
      aria-label="Screeno home"
    >
      <span className="screeno-brand-mark" aria-hidden="true">
        <ScreenoMark />
      </span>
      <span className="screeno-wordmark">
        screeno<span className={light ? "text-lime" : "text-brand"}>.</span>
      </span>
    </Link>
  );
}
