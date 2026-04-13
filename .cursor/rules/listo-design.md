Design system and UI/UX implementation guide for Listo, a climate resilience coordination platform for frontline disaster responders in the Philippines and ASEAN. Use when building React components, designing screens, implementing navigation, writing Tailwind styles, updating theme tokens, or making any UI/UX decision for the Listo platform. Triggers on requests like "build this component", "redesign this screen", "implement this layout", "update the navigation", "style this element", "update theme.css", or "make this responsive". Also triggers on any mention of Listo, SkillSeed, mission cards, the Act screen, Grow screen, Together screen, ambient strip, or verification flow.AuthorSkillSeedClimateVersion3.0.0Categoryfrontend-designListo Design System
Critical Technical Context — Read First
This project uses Tailwind CSS v4 with CSS-first configuration.
There is NO tailwind.config.ts. All design tokens are CSS custom
properties in src/styles/theme.css. All token changes go in that
file only.
CSS architecture:

src/styles/index.css imports fonts.css, tailwind.css, theme.css
src/styles/fonts.css — Google Fonts imports and font variables
src/styles/tailwind.css — Tailwind v4 setup
src/styles/theme.css — ALL CSS custom properties (source of truth)

UI components use Radix UI with shadcn pattern (53 components in
app/components/ui/). Do NOT use MUI. MUI is installed but conflicts
with the Radix system and should be avoided entirely.
State management: no global store. Three hooks only — useAuth,
useDemoMode, useShowBlockingFullPageLoader. Data fetching is per-
component via Supabase.
Routing: React Router v7. All main routes are children of the Layout
component (Navbar + Footer). Verifier routes are top-level siblings
with no Layout.
Platform Identity
Listo is a climate resilience coordination platform — not a climate
learning app. It replaces fragmented WhatsApp, Facebook, and Google
Forms coordination with one accountable loop: match → deploy → verify
→ report. It serves frontline disaster responders in the Philippines
and ASEAN: barangay coordinators, municipal DRRM officers, community
volunteers, and LGU partners.
Design for this user: a barangay coordinator using the platform one-
handed, in bright outdoor sunlight, on a mid-range Android device,
with intermittent connectivity, during an active climate emergency.
Every design decision serves that user first.
Data Integrity Rules — Non-Negotiable
The platform is in pre-launch pilot phase. No real users exist yet.

NEVER add fake user names, fake profiles, or fake community posts
NEVER add fake aggregate metrics (no "1,248 verified actions")
NEVER add fake streaks or fake leaderboard entries
Show honest empty states where user-generated content would appear
Platform content (missions, quests, funding) CAN be shown because
admin creates these before users arrive
Pre-launch counters show "—" dash placeholder
Empty states invite the first real user to begin

Color Token System
All tokens are CSS custom properties in src/styles/theme.css.
Use var(--token-name) in components. Never use hard-coded hex
values in new components.
Elevation System (no shadows — depth through color only)

Level 0 base: #0D1F15 — all page backgrounds
Level 1 cards: #152C1E — all card and panel surfaces
Level 2 elevated: #1A3525 — hover states, coaching panel
Level 3 overlay: #203D2E — modals, drawers, sheets
Level 4 tooltip: #2D4A3A — tooltips, dropdowns

Accent Colors

Primary accent: #4ADE80 — primary actions, active states,
progress fills, verified indicators, focus borders. This is
the ONLY color that signals action and life.
Achievement accent: #F59E0B — ONLY for points, streaks,
badge achievements, reward moments. NEVER for navigation or
structural UI.

Text Colors

Primary: #FFFFFF
Secondary: rgba(255,255,255,0.6)
Muted: rgba(255,255,255,0.4)

Semantic Colors

Border default: #1E3A28
Success: #22C55E
Warning: #F59E0B (same as achievement accent)
Error/Urgent: #EF4444
Offline bar: 4px #EF4444 at absolute top of screen

Known Hard-coded Values to Fix
These components bypass the token system. Convert when touching:

app/components/Navbar.tsx — dark border #1E3B34, hover #17342B
app/components/Footer.tsx — bg #0A2E20, text #94C8AF
app/components/DemoBanner.tsx — bg #0F2C22, text #BEEBD7

Typography System
Three fonts from Google Fonts loaded via src/styles/fonts.css.
CSS variables:

--font-display: 'Fraunces', Georgia, serif
--font-heading: 'Syne', system-ui, sans-serif
--font-body: 'Plus Jakarta Sans', system-ui, sans-serif

Usage Rules — Strictly Enforced
--font-display (Fraunces):

Hero headlines only
Large collective impact numbers
Quest completion celebrations
The single most emotionally significant text per screen
NEVER below 32px
NEVER for navigation, buttons, UI labels, or body text

--font-heading (Syne):

All navigation labels
Card titles
Section headers
Button text
Badge text
Tab labels
Modal titles
Screen titles
All UI chrome
Weights: 500 standard, 600 card titles, 700 screen titles

--font-body (Plus Jakarta Sans):

All body text
Descriptions
Metadata
Timestamps
Helper text
Coaching panel content
Proof submission text
All text at or below 16px
Weights: 300 muted, 400 regular, 500 medium, 600 semibold

Known Inconsistency to Fix
Current code uses font-[Manrope] arbitrary Tailwind values.
Replace all instances with var(--font-heading) (Syne).
Remove Manrope and Inter from fonts.css after migration.
Spacing and Layout
Base unit: 4px (Tailwind default).
Standard page container:
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 — use on every page.
Key measurements:

Card padding standard: 16px
Card padding featured: 20px
Card border radius: 12px (rounded-xl)
Button border radius: 8px (rounded-lg)
Tag/pill border radius: 24px
Touch target minimum: 48x48px on ALL interactive elements
Ambient strip height: 28px maximum
Connectivity bar height: 4px at absolute screen top
Mobile bottom nav height: 64px minimum
Screen padding mobile: 16px horizontal
Screen padding tablet: 24px horizontal
Screen padding desktop: 32px horizontal
Max content width desktop: 1200px centered

Navigation Architecture
Three primary sections replace the old four-item navigation.
Act

Purpose: finding missions, joining tasks, field deployment
Replaces: old Missions + active Hands-on components
Icon: Crosshair or Compass from Lucide
Route: /act (currently /dashboard, /browse, /missions)

Grow

Purpose: learning quests, AI coaching, skill development, progress
Replaces: learning Hands-on + Progress Tracker
Academy consolidates here as entry point
Icon: Sprout from Lucide
Route: /grow (currently /hands-on, /quests)

Together

Purpose: community challenges, collective feed, leaderboard
Replaces: old Community section
Icon: Users or network from Lucide
Route: /together (currently /community)

Funding (no longer primary navigation)

Surfaces contextually within Act when missions have funding
Surfaces contextually within Together when challenges have grants
Keep /funding route for direct access but remove from primary nav

Persistent Ambient Strip
Every authenticated screen carries this strip. Max 28px tall.
Background: #152C1E. Bottom border: 1px #1E3A28.
Pre-launch state (no real users yet):

Left: "LISTO" pill in rgba(255,255,255,0.4) — no role assigned
Center: "Be the first verified responder." italic rgba muted
Right: "—" rgba muted — no streak yet

Populated state (when real users exist):

Left: role badge pill — "BARANGAY COORDINATOR" etc in #4ADE80
Center: verified action count in Fraunces bold #4ADE80
Right: Flame icon + streak count in Syne medium #F59E0B

Connectivity Indicator
4px horizontal bar at absolute top of every screen.

#22C55E when connected
#F59E0B when weak signal
#EF4444 when offline

Never hidden. Never optional. Most critical accessibility feature
for a field coordination tool.
Component Conventions
All new components follow these rules:

TypeScript with explicit prop type definitions — no any types
Tailwind utility classes for all styling
No inline styles except dynamic computed values
CVA (class-variance-authority) for variant-based styling
cn() utility from ui/utils.ts for conditional class merging
All icons from lucide-react exclusively — never MUI icons
All interactive elements: min-h-[48px] min-w-[48px]
Focus states: 2px #4ADE80 outline 2px offset
Loading states: skeleton screens, never spinners alone
Error states: specific failure + cache status + queue status
Empty states: why empty + what to do + preview of populated

Mission Card System
Each mission card shows urgency through left border color:

CRITICAL: 4px left border #EF4444 + red "CRITICAL" badge
ACTIVE: 4px left border #F59E0B + amber "ACTIVE" badge
STABLE: no left border

Card structure:

Background: #152C1E, border-radius: 12px, padding: 16px
Top: category icon (Lucide, 20px, #4ADE80) in #1A3525 square
Top right: status badge (Syne 10px uppercase)
Title: Syne semibold 15px white
Description: Plus Jakarta Sans 13px rgba(60%) 1 line
Footer: Clock + time · MapPin + location · Users + count
(all Plus Jakarta Sans 12px muted, Lucide 16px icons)

Quest Card System
Three impact levels with visual differentiation:

HIGH IMPACT: 4px left border #4ADE80 + "HIGH IMPACT" #F59E0B badge

impact statement in Plus Jakarta Sans 13px #4ADE80 italic


MEDIUM IMPACT: 2px left border #2D6A4F, no badge
FOUNDATIONAL: no border, no badge

Card structure:

Background: #152C1E, border-radius: 12px, padding: 16px
Top left: category icon Lucide 20px #4ADE80 in #1A3525 rounded sq
Top right: "+50 PTS" or "+100 PTS" Syne bold 12px #F59E0B
Title: Syne semibold 16px white
Impact statement (HIGH IMPACT only): Plus Jakarta Sans 13px #4ADE80
Description: Plus Jakarta Sans 13px rgba muted
Progress bar (if started): 6px height, #4ADE80 fill, #1E3A28 track
Footer: Clock + days muted · Zap + points #F59E0B

AI Coach Conventions
The AI coach is an automated system. It has no human name and no
human photo. Never give it a fake persona.
Display as:

Bot icon from Lucide, 20px, #4ADE80
"Listo AI Coach" in Syne semibold white
"POWERED BY CLAUDE · ANTHROPIC" in Syne 10px uppercase #4ADE80
Green active dot 8px when available

Pre-launch empty state:

MessageSquare icon 32px rgba muted centered
"Start a quest to activate your coach." Syne medium rgba muted
Input field appears disabled until user begins a quest

Active state (user in a quest):

Coach messages: #152C1E 12px corners Plus Jakarta Sans 14px white
User messages: #4ADE80 background 12px corners #0D1F15 text
Action pills: #152C1E 1px #1E3A28 border Syne 12px 32px 8px
Input: #0D1F15 background, placeholder rgba muted, Send icon #4ADE80

Disclosure below input (always visible):
"Your conversations help improve coaching for all Listo users.
Opt out in Settings." Plus Jakarta Sans 11px rgba(255,255,255,0.3)
AI screening disclosure in verifier dashboard:
"AI assists with initial review. Your decision is final and
overrides any AI suggestion."
Proof Submission Flow
Upload zone:

200px tall, dashed 2px #2D6A4F border, 12px corners
Camera icon Lucide 32px #4ADE80 centered
"Add your field photo" Syne medium 16px white
"or upload from gallery" Plus Jakarta Sans 13px muted

Reflection prompt (not a form label):
"What did you protect today?" Syne semibold 18px white
AI reflection assist button:

#1A3525 background, 1px #4ADE80 border, #4ADE80 text
"Improve my reflection" Syne 13px, 36px height, 8px corners

Verification note below submit button:
"Your submission will be reviewed by a verified human reviewer
within 24 hours. AI assists but does not make final decisions."
Verifier Dashboard Conventions
The verifier dashboard is a separate portal — no main navigation,
no Footer, no Navbar. Verifier-only authentication required.
AI assessment card labels it as "AI PRE-SCREENING" not "AI DECISION".
Confidence shown as qualitative label: "High Confidence", "Medium
Confidence", "Low Confidence" — never a fake percentage number.
Reasoning shown as explanatory text, not a score.
AI suggestion explicitly labeled: "AI Suggestion: Approve" not
"AI Decision: Approve".
Human decision buttons labeled: "Approve", "Flag for Review", "Reject"
Note below buttons: "Your decision is logged and final. AI
suggestions are advisory only."
Institutional Design Principles Checklist
Apply before finalizing any component or screen:
MIT: Does this element change a user's decision or action?
If purely decorative, remove it.
Stanford: Does this serve a specific named real user in a specific
real situation — not a hypothetical generic user?
CMU: Is the information hierarchy derived from the outcome hierarchy
rather than aesthetic preference?
Berkeley: Does this work on a cracked low-end Android in bright
sunlight? Does it reproduce or challenge existing inequalities?
IIT: Can this be 20% lighter, faster, or simpler without losing
functionality?
NUS: Is this appropriate for users across the Philippines and ASEAN,
not just English-speaking urban users?
Neuroscience: Does this serve the user's neurological state in this
moment — attention, motivation, cognitive load?
YC: Does this exist because users genuinely need it, or because it
seemed like a good idea during development?
What to Preserve from Current Design

Deep forest green palette — do not replace with light backgrounds
Card-based content structure — evolve it, do not abandon it
Amber yellow achievement system — keep it
Three-role onboarding (Learner, Volunteer, Organization) — keep it
Skeleton loading states pattern — already well-implemented
44px/48px minimum touch targets — already enforced, maintain it

Known Issues — Fix When Touching These Files

Dual library conflict: Radix UI + MUI both installed. Avoid MUI
in all new work. Remove from package.json when possible.
Two carousel libraries: embla-carousel-react and react-slick.
Use Embla only via ui/carousel.tsx.
Hard-coded colors in Navbar, Footer, DemoBanner — convert to
CSS variables when modifying these components.
font-[Manrope] arbitrary values — replace with var(--font-heading)
Route aliasing: /dashboard + /browse + /missions all render the
same component. Consolidate to /act.
Academy (/academy) and Hands-on (/hands-on) overlap —
consolidate under Grow in new navigation.
No centralized route constants file — create src/constants/routes.ts
No global state management — state is per-component via Supabase.
Large pages (CommunityChallenges 1421 lines, MissionDashboard 1144
lines) carry all data-fetching internally.

Self-Check Before Finalizing Any Component
Run this checklist on every component before considering it complete:

 Every color uses a CSS custom property, no hard-coded hex
 Every font uses --font-display, --font-heading, or --font-body
 Every interactive element has min-h-[48px] min-w-[48px]
 Every standalone icon has an aria-label attribute
 Loading state uses a skeleton matching the populated layout
 Empty state answers: why empty + what to do + preview
 Error state names the failure + cache status + queue status
 No fake user data, no fake names, no fake metrics anywhere
 Pre-launch counters show "—" not inflated numbers
 AI coach has no human name or human photo

Reference Files
For complete specifications, read the relevant reference:

references/color-tokens.md — full elevation system and token map
references/navigation-architecture.md — complete nav spec
references/component-conventions.md — all component patterns
references/accessibility-requirements.md — WCAG AA full spec
references/institutional-principles.md — design principles detail