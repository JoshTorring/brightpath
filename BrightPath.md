Design Document — “BrightPath” ADHD Support Web App

pnpm monorepo • TypeScript-first • Family-friendly with an NHS look and feel

1) Purpose & Goals

Mission: Help children with ADHD and their families build skills and confidence while giving practitioners clear, longitudinal insight via standardized patient-reported outcome measures (PROMs).

Primary goals

Make evidence-based content approachable for children and useful for adults.

Provide secure logins for families and practitioners.

Deliver a standardized PROM experience with clear scoring and trends.

Give practitioners patient lists, details, and PROM histories.

Offer an insights dashboard that highlights strengths, challenges, and suggested next steps.

Present an NHS-style visual language that’s calm, friendly, and age-appropriate.

Non-goals (for initial release)

Real-time chat/telehealth.

EHR integration (can be Phase 3).

Complex multi-clinic billing.

2) Users & Jobs-to-be-Done

Children (7–15)

See simple explanations, examples, and activities without jargon.

Track progress (“streaks”, “badges”) without pressure.

Parents/Carers

Complete PROMs; review progress over time.

Find actionable strategies and credible references.

Practitioners (NHS clinicians, educational psychologists, paediatricians)

View patient panels, PROM timelines, and risk flags.

Share recommendations and track adherence.

Admins (internal)

Manage clinics, practitioner verification, taxonomies, and content publication.

3) Core Features
3.1 Authentication & Onboarding

Email/password + optional SSO (NHS Login in later phase).

Roles: patient, parent, practitioner, admin (RBAC).

Practitioner verification flow (GMC/NMC number or clinic invite).

Consent management (parental consent for children; data processing consents).

3.2 PROMs (Patient-Reported Outcome Measures)

Configurable engine supporting standardized ADHD PROMs (e.g., SNAP-IV, Vanderbilt).

Age-appropriate wording and read-aloud mode.

Scoring rules encapsulated per instrument (Zod-validated).

Longitudinal storage, versioned instruments, partial-save drafts.

Completion reminders (email/push opt-in).

Export: PDF summary for families; CSV for practitioners.

Clinical note: Instruments and cut-scores are configurable and reviewed by clinical governance before publication. The app does not diagnose; it visualizes self-reported data for shared decision-making.

3.3 Practitioner Workspace

Patient list with search, filters (clinic, age, last activity, risk flags).

Patient profile: demographics, contacts, consent status, PROM history, notes (non-PHI comments kept separate if required).

PROM timeline: score trajectories, subscale breakdowns, adherence markers.

3.4 Family Dashboard

Friendly charts showing trend over time and areas to focus on.

“What this means” cards: short plain-English explanations and next steps.

Strengths callouts (celebrate improvements to reduce anxiety).

3.5 Learn Hub (Child-friendly Education)

Topic pages (e.g., attention, impulsivity, sleep, routines, school strategies).

Two-layer content: child view (plain language, visuals) + parent deep-dive (nuance, research links).

Bite-size activities, checklists, downloadable planners.

Curated evidence summaries with citations and “explain-like-I’m-10” sections.

3.6 Insights & Recommendations

Rule-based signals over PROM deltas (e.g., “Hyperactivity up >20% over 6 weeks”).

Suggest relevant Learn Hub topics and quick actions (e.g., “Try a visual schedule”).

Practitioner notes can pin recommendations to the family dashboard.

4) Experience & Design
4.1 NHS-inspired, Calm, Friendly

Base on NHS.UK design DNA (NHS Blue #005EB8, whites, accessible contrasts), with soft shapes, rounded corners, and warm illustrations.

Typography: large, legible headings; short paragraphs; dyslexia-friendly spacing.

Avoid red for alerts; use amber/blue with clear iconography.

4.2 Accessibility & Inclusion

WCAG 2.2 AA target; keyboard/reader-first nav; ARIA labels; high contrast mode.

Read-aloud toggle on all child content; captions/transcripts for media.

Plain-language reading level for child view; glossary rollover for parent view.

Localization-ready (i18n keys; English first).

4.3 Key Screens (wireframe notes)

Home (unauth): big CTA “For families” / “For practitioners”; reassurance copy.

Family Dashboard: line chart (last 12 weeks), focus areas grid, “Today’s tips”, “Celebrate wins”.

PROM Session: progress stepper, one question per screen (mobile-first), save/resume.

Practitioner Panel: table with patient, last PROM, change indicator, flags.

Patient Profile: mini cards (contact, consents), score timelines, note drawer.

Learn Hub: topic index → child/parent tabs → “Try this today” tasks.

5) System Architecture (pnpm monorepo, TypeScript)
5.1 Monorepo Layout
/brightpath
  /apps
    /web                # Next.js (families + practitioners)
    /api                # NestJS (REST/GraphQL) or tRPC server
    /admin              # Content/back-office (Next.js or a headless CMS UI shell)
  /packages
    /ui                 # Shared React UI lib (NHS theme, design tokens)
    /content            # MDX content + schemas + generators
    /auth               # Auth SDK (RBAC, client hooks, guards)
    /prom               # PROM engine (item banks, scoring, Zod schemas)
    /types              # Shared TypeScript types
    /config             # tsconfig, eslint, jest, tailwind presets
    /db                 # Prisma schema, migrations, seeders
    /analytics          # Event contracts, privacy-safe wrappers


Why pnpm: fast, disk-efficient, strict dependency hoisting.
Build: turborepo pipelines with task caching.

5.2 Frontend

Next.js (App Router) + React Server Components for data-fetching and caching.

Styling: Tailwind + CSS variables for NHS theme; Radix primitives; shadcn/ui for controls adapted to NHS style.

Charts: Recharts (accessible SVG); print/export modes.

Forms: React Hook Form + Zod.

Content: MDX with “Child” and “Parent” slots per page.

5.3 API Layer

NestJS (TypeScript) with modular domains: auth, users, prom, patients, practitioners, content, insights, audit.

Transport: REST (JSON) initially; GraphQL optional for rich querying; OpenAPI spec generated.

Validation: Zod or class-validator; input/output types shared via /types.

Background jobs: BullMQ (Redis) for reminders, scoring, nightly signals.

5.4 Data & Storage

PostgreSQL (primary).

Prisma ORM with strict schemas and migrations.

Redis for sessions, cache, queues.

Blob storage (S3-compatible) for PDFs and media.

CMS options:

Phase 1: MDX in /packages/content (reviewed and versioned).

Phase 2: adopt Headless CMS (e.g., Sanity/Contentful) through a content adapter.

5.5 Security & Compliance

RBAC and tenant boundaries (clinic/org).

PII/PHI minimized; encryption at rest (DB, S3) and in transit (TLS).

Audit logging (read/write, consent changes, exports) to append-only store.

Secrets via environment manager (e.g., Doppler/Vault).

GDPR/UK DPA 2018 aligned; Age-Appropriate Design Code considerations.

Session + CSRF protection; rate limiting; password policy; email verification.

5.6 Observability

Structured logging (pino), request IDs.

Metrics (Prometheus/OpenTelemetry); alerting (e.g., Grafana).

Error tracking (Sentry).

5.7 Deployment

Containers (Docker) per app; IaC (Terraform).

Environments: dev / staging / prod.

Database migrations gated by manual approval on prod.

CDN for static assets; edge caching for Learn Hub pages.

Backups, PITR; disaster recovery runbook.

6) Data Model (high-level)
User(id, email, name, role, verifiedAt, orgId?)
ChildProfile(id, userId (parent), name, dob, preferredName, avatar, consentStatus)
Practitioner(id, userId, orgId, verificationStatus, specialties)

PatientLink(id, childId, practitionerId, orgId)   # links practitioner to child

PromInstrument(id, key, version, title, meta, scoringSpec)
PromSession(id, childId, instrumentId, startedAt, completedAt, status, scoreJson, subscaleJson, flaggedAreas[])
PromResponse(id, sessionId, itemId, value)

ContentTopic(id, slug, title, tags[], summary, readingLevel)
ContentPage(id, topicId, locale, childMdx, parentMdx, sourcesJson, version, publishedAt)

InsightSignal(id, childId, periodStart, periodEnd, type, severity, payloadJson)
Note(id, childId, practitionerId, body, createdAt, visibility)  # visibility: private/practice/family

AuditEvent(id, actorUserId, action, entityType, entityId, timestamp, metadataJson)
ConsentRecord(id, childId, actorUserId, kind, grantedAt, revokedAt?)

7) PROM Engine Details

Instrument registry: item banks; question text variants (child/parent wording); subscales; reverse-scoring flags; score formulas.

Renderer: form components built from instrument JSON + Zod schema; one-question or sectioned layouts.

Scoring: deterministic pure functions—unit tested; emits total + subscale scores + norms (if configured).

Versioning: sessions store instrument version; historical scores computed with same version for integrity.

Flags: configurable thresholds to raise Attention Support, Hyperactivity Support, Sleep Hygiene, etc.

Exports: human-readable PDFs with interpretation guidance and links to Learn Hub topics.

8) Insights (Rules First, ML Later)

Phase 1 (rules):

Rising-trend detection (>X% change vs. prior median).

Missing-data alerts (stalled adherence).

Contextual suggestions (map subscale → content topics).

Phase 2 (lightweight ML, opt-in):

Personalised content ranking using collaborative filtering on anonymized events.

All insights are explainable and reviewable by practitioners; families see gentle, supportive language.

9) Content Model & Tone

Every topic has:

Child view: short sentences, examples, illustrations, read-aloud.

Parent view: deeper context, “how to try this”, environment setup, school collaboration tips.

Evidence box: 3–5 key study findings in plain English + links to readable summaries.

Practice cards: printables (routine charts, reward charts, checklists).

Editorial workflow: draft → clinical review → sensitivity review → publish; semantic versioning.

10) Privacy, Consent, and Ethics

Parent/guardian consent required for accounts involving children under 16.

Data minimization by default; families can delete accounts and request exports.

Clear copy about what the app is (support tool) and is not (diagnostic).

Dark patterns explicitly avoided; no advertising; analytics strictly essential and anonymous.

11) Testing Strategy

Unit: scoring functions, content adapters, RBAC guards.

Component: React Testing Library; accessibility checks (axe).

Contract: API schemas tested with Zod + Pact (if external consumers later).

E2E: Playwright—key flows (login, PROM complete, practitioner review, content reading).

Security: dependency scanning; ZAP/Burp in CI; periodic pen-test (Phase 2).

Load: k6 scenarios for peak PROM windows.

12) CI/CD & Quality Gates

Turborepo pipelines: lint → typecheck → test → build → preview deploy.

Conventional commits + changesets for versioning.

Required reviews for /packages/prom and /packages/content.

OpenAPI generated and published to /packages/types.

13) Risks & Mitigations
Risk	Mitigation
Clinical validity drift if instruments change	Versioned instruments + release notes; freeze historical scoring per version
Anxiety from “red” flags	Gentle language, neutral colors, clear “what to do next”
Practitioner onboarding friction	Invite links + verified registry; admin overrides with audit trail
Content governance workload	Editorial calendar; modular MDX; batch review tooling
Data protection	DPIA, strong encryption, least-privilege, regular audits
14) Phased Delivery Plan

Phase 1 (MVP, ~8–10 weeks)

Auth (email/password), RBAC, verified practitioners.

PROM engine with one instrument (e.g., SNAP-IV), scoring, PDFs.

Family dashboard (trends), practitioner list & patient profiles.

Learn Hub (5–8 topics) with child/parent views.

NHS-inspired theme, WCAG AA, basic analytics.

Phase 2

Additional instruments; reminders; richer insights; exports (CSV).

Admin/CMS workflows; localization; practitioner annotations.

Phase 3

NHS Login SSO; EHR integrations (FHIR APIs); ML content ranking (opt-in).

Mobile app shell (React Native) if needed.

15) Example Routes & Components

Web (Next.js App Router)

/ (home)
/login
/register
/family/dashboard
/family/child/[childId]
/prom/start/[instrumentKey]
/prom/session/[sessionId]
/learn
/learn/[topicSlug]
/practitioner
/practitioner/patients
/practitioner/patient/[childId]
/settings/account


Key components

<NhsHeader/>, <NhsCard/>, <InfoCallout tone="calm"/>

<PromForm/>, <PromStepper/>, <ScoreChart/>

<InsightBadge/>, <RecommendationList/>

<DualViewTabs childLabel="For kids" parentLabel="For parents" />

<EvidenceSummary sources={...} />

16) Theming (NHS + Friendly)

Palette tokens: --bp-nhs-blue, --bp-ink, --bp-amber, --bp-mint, --bp-cream.

Motion: gentle 150–200ms easings; prefers-reduced-motion respected.

Illustrations: soft, rounded; diverse families; inclusive by default.

17) Example Tech Choices (summary)

Frontend: Next.js, React, Tailwind, shadcn/ui, Recharts, MDX.

Backend: NestJS, PostgreSQL (Prisma), Redis (BullMQ), OpenAPI.

Auth: JWT (HTTP-only cookies) + role guards; optional future NHS Login.

Infra: Docker, Terraform, managed Postgres/Redis, Cloud CDN.

Quality: TypeScript everywhere; Zod validation; Playwright E2E; Sentry; OTel.

18) Acceptance Criteria (MVP)

Families can register, consent, add a child profile, complete a PROM, and see a chart + recommendations.

Practitioners can log in, see their patient list, open a profile, and review PROM history with subscales.

Learn Hub presents child-friendly & parent-depth content, with evidence summaries.

All pages pass automated a11y audits and meet AA contrast.

PDF export for a completed PROM (family summary).

Audit events are recorded for logins, PROM submissions, and exports.

19) Appendix: Sample PROM Scoring Contract (TypeScript)
// packages/prom/src/types.ts
export type Likert = 0 | 1 | 2 | 3; // Never→Very Often

export interface PromAnswer {
  itemId: string;
  value: Likert;
}

export interface InstrumentSpec {
  key: string; version: string;
  items: Array<{ id: string; textParent: string; textChild?: string; subscale: string; reverse?: boolean }>;
  subscales: string[]; // e.g. ["Inattention","Hyperactivity"]
  score: (answers: PromAnswer[]) => {
    total: number;
    subscales: Record<string, number>;
    flags: string[]; // e.g. ["Focus Support"]
  };
}

Final note on tone & ethics

The product should consistently reassure families, celebrate progress, and avoid medicalized language in the child view. Every insight pairs a kind explanation with a small next step—because tiny wins add up.

If you’d like, I can turn this into a starter monorepo skeleton (folders, configs, Prisma schema, and a few example screens) so you can boot it locally with pnpm i && pnpm dev.