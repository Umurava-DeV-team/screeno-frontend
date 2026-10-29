import type { Metadata } from "next";
import "./globals.css";
import "./studio-auth.css";
import "./studio-workspace.css";
import "./studio-review.css";
import "./studio-account.css";
import "./studio-candidate.css";
import { displayFont, landingFont } from "@/lib/landingFont";
import { ReduxProvider } from "@/components/providers/ReduxProvider";

import AppBootLoader from "@/components/AppBootLoader";

export const metadata: Metadata = {
  title: "Screeno | Recruiter portal",
  description:
    "Screeno gives recruiters one place to manage applicants, review skills with their team, and track hiring decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${landingFont.variable} ${displayFont.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen antialiased font-sans">
        <ReduxProvider>
          <AppBootLoader>{children}
          </AppBootLoader>
        </ReduxProvider>
      </body>
    </html>
  );
}
