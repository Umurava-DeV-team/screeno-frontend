/**
 * Frontend-review transport. This module intentionally has no fetch(), base URL,
 * JWT header, environment toggle, or HTTP fallback. Backend integration is a
 * separate, approval-gated implementation phase.
 */
export { demoRequest as apiFetch } from "./demo/transport";
