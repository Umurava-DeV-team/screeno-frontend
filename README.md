# Screeno frontend

Screeno is a recruiter workspace for jobs, applicant review, interviews, assessments and hiring reports. A candidate workspace supports the application and assessment journey.

## Current phase

This repository is a **frontend review build** with fictional local data. The backend, AI services, real authentication, email/SMS, sockets, camera/microphone access and code execution remain disconnected. A successful production build verifies the application bundle; it does not turn this preview into a live hiring system.

## Run

    npm ci
    npm run dev

Open http://localhost:3000/auth. Choose Recruiter or Candidate inside the sign-in form, select **Use demo details**, and continue with the displayed demo code **123456**.

Signup follows email verification, then returns to sign-in. Recovery follows email → six-digit code → reset form. No account is created, no message is sent, and no real password changes. Passwords and codes are not persisted. Challenges expire after five minutes, enforce role and purpose, and allow five attempts.

For the production bundle:

    npm run build -- --webpack
    npm start

## Workspaces

| Recruiter | Candidate |
| --- | --- |
| Overview, jobs and applicants | Overview, opportunities and applications |
| Screening studio | Assessment tasks and feedback |
| Assessment studio: drafts, active assessments and submissions | My hiring journey |
| Analytics and hiring toolkit | Skills, work samples and sharing preferences |
| Profile, settings and notifications | Profile, settings and notifications |

Screening follows **choose a role → review applicants → review results**. Assessments follow **choose a role → edit questions → preview → assign → review submissions**. The hiring toolkit explains each supporting tool in plain language and links directly to it.

## Data and boundaries

Application calls use lib/api.ts → lib/demo/transport.ts → lib/demo/store.ts. Jobs, applicants, applications, sample screening results, assessment drafts, assignments, saved answers, local multiple-choice scores, feedback and notifications use this adapter. There is no environment switch that reconnects a live service.

Fictional records persist in browser localStorage under talentscreen.frontend-preview.v1; restricted storage contexts fall back to memory. Profile photos use a separate account-scoped local key. Resume selection saves filename metadata only. Switching roles retains the sample dataset and clears the previous Redux session.

Use fictional information only. Browser storage and sample answer keys are inspectable and are not production authorization or secure storage. Open assessment answers require human review. Sample match scores do not make hiring decisions.

## Exports and visual system

Every table/report export menu offers CSV and styled PDF. Exports contain the records matching the current filter and sort. CSV escapes cells and protects spreadsheet formulas. PDFs embed Manrope, repeat column headings, number pages, and include a generated date in Africa/Johannesburg.

Manrope is self-hosted; its license is in public/fonts/manrope/OFL.txt. Screeno uses cobalt, lime, white and dark ink, with 3px CRUD modal corners. Motion includes section-triggered reveals, staggered page choreography, card depth and spring navigation indicators. Reduced-motion preferences are respected.

## Validation

    npm run test:demo
    npx tsc --noEmit
    npm run build -- --webpack
    npm run lint

The behavioral suite covers local CRUD, permissions, assessment sessions, OTP/recovery safeguards, CSV safety and source checks against live service wiring. Only two fixed local font asset URLs are permitted by the network source check.

The repository still has legacy lint findings outside the redesigned modules. Resolve those findings, complete accessibility acceptance, and integrate and test real server authentication, authorization, file storage and service contracts before a production launch. Backend reconnection is a separate phase after frontend approval.