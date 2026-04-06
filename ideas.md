# CampaignIQ Dashboard — Design Brainstorm

## Context
Marketing performance dashboard for CampaignIQ. Must visualize campaign metrics, channel performance, and ROI. Key features: KPI cards, channel breakdown chart, campaign comparison table, budget allocation donut chart, sidebar navigation. User requests minimal style with soft gradients and rounded corners.

---

<response>
## Idea 1: "Frosted Glass Analytics" — Glassmorphism meets Data Clarity

<text>

**Design Movement:** Glassmorphism / Nordic Minimalism hybrid

**Core Principles:**
1. Translucent layering — cards and panels use frosted glass effects with backdrop-blur, creating depth without heaviness
2. Whisper-soft color — a near-white canvas with subtle cool-toned gradients (lavender to ice blue) that shift gently across sections
3. Information hierarchy through opacity — more important data uses higher opacity panels, secondary info recedes
4. Generous breathing room — large padding, spacious gaps, content never feels cramped

**Color Philosophy:** A palette built around trust and clarity. Primary: deep indigo (#4F46E5) for authority. Accents: soft teal (#14B8A6) for positive metrics, warm coral (#F97316) for alerts. Background: off-white with subtle lavender undertone. The emotional intent is "calm confidence in your data."

**Layout Paradigm:** Fixed left sidebar (240px) with frosted glass effect, main content area uses a fluid asymmetric grid — KPI cards span full width in a 4-column row, then a 60/40 split for charts below, with the table spanning full width at the bottom.

**Signature Elements:**
1. Frosted glass cards with 1px white border and subtle inner glow
2. Animated gradient orbs floating behind the main content area (purely decorative, very subtle)
3. Micro-sparkline indicators inside KPI cards showing 7-day trends

**Interaction Philosophy:** Hover reveals depth — cards lift slightly with enhanced shadow. Chart segments expand on hover with tooltip. Sidebar items have a sliding highlight bar. Everything feels weightless and responsive.

**Animation:** Cards fade-in with staggered timing on page load. Chart data animates from zero. Sidebar transitions use spring physics (framer-motion). Number counters animate up to their values.

**Typography System:** Display: "Plus Jakarta Sans" (700 weight) for headings and KPI values. Body: "Plus Jakarta Sans" (400/500) for labels and table content. Monospace: "JetBrains Mono" for numerical data in tables. Size scale: 48px hero numbers, 24px section titles, 14px body, 12px labels.

</text>
<probability>0.07</probability>
</response>

---

<response>
## Idea 2: "Ink & Paper" — Editorial Data Storytelling

<text>

**Design Movement:** Swiss Typography / Editorial Design adapted for dashboards

**Core Principles:**
1. Typography-first hierarchy — data is presented with newspaper-grade typographic precision
2. Stark contrast with warm accents — predominantly black/white with a single accent color (warm amber) for emphasis
3. Grid discipline — strict 12-column grid with mathematical spacing ratios
4. Data as narrative — metrics are presented in a reading flow, top-to-bottom, left-to-right

**Color Philosophy:** Near-black (#1A1A2E) sidebar, pure white (#FFFFFF) content area, warm amber (#F59E0B) as the sole accent for active states and positive indicators. Muted slate (#64748B) for secondary text. The intent is "authoritative editorial clarity" — like reading the Financial Times data section.

**Layout Paradigm:** Dark sidebar anchors the left edge. Content area uses a strict newspaper-column layout: KPI cards as a horizontal "headline strip," charts arranged in a 2-column editorial spread, table as the "body copy" section with clear column rules.

**Signature Elements:**
1. Thin horizontal rules separating sections (like newspaper column dividers)
2. Large serif numerals for KPI values creating visual drama
3. Subtle dot-grid background pattern on the content area

**Interaction Philosophy:** Understated and precise. Hover states use underline reveals (editorial style). Active sidebar items get a thin amber left border. Charts use crosshair cursors. Everything feels intentional and measured.

**Animation:** Minimal — content fades in quickly. Numbers count up with easing. Chart bars slide in from baseline. No bouncy or playful motion. Transitions are crisp (200ms ease-out).

**Typography System:** Display: "Playfair Display" (700) for KPI numbers and section headers. Body: "Source Sans 3" (400/600) for all other text. The contrast between serif display and sans-serif body creates visual tension and hierarchy. Size: 56px KPI numbers, 20px headers, 14px body, 11px micro-labels.

</text>
<probability>0.05</probability>
</response>

---

<response>
## Idea 3: "Soft Terrain" — Organic Gradient Landscape

<text>

**Design Movement:** Soft UI (Neumorphism-lite) meets Organic Modernism

**Core Principles:**
1. Terrain-inspired gradients — background uses very soft multi-stop gradients that evoke rolling hills or cloud layers
2. Rounded everything — generous border-radius (16-24px), pill-shaped badges, circular avatars
3. Soft depth without harsh shadows — using layered box-shadows with large blur and low opacity
4. Warm neutrals — moving away from cold grays toward warm stone and sand tones

**Color Philosophy:** Background gradient from warm cream (#FDF8F4) to soft sage (#F0F4F0). Primary: muted teal (#0D9488) for trust and growth. Secondary: soft violet (#8B5CF6) for creative campaigns. Accent: warm rose (#F43F5E) for urgent items. Chart colors: a harmonious set of muted earth tones. The emotional intent is "approachable intelligence."

**Layout Paradigm:** Sidebar with rounded inner edges and a subtle gradient. Main area uses a "terrain" layout — KPI cards float in a staggered row with slight vertical offset, charts sit in rounded containers with generous padding, table uses alternating warm-toned rows. Sections have organic spacing that varies slightly.

**Signature Elements:**
1. Soft inner shadows on input fields and sidebar (neumorphic touch, very subtle)
2. Gradient-filled donut chart segments with rounded caps
3. Status badges using pill shapes with pastel backgrounds matching their semantic color

**Interaction Philosophy:** Tactile and warm. Cards press inward slightly on click (neumorphic press). Hover adds a warm glow around elements. Sidebar items have a rounded highlight that slides smoothly. Everything feels touchable and friendly.

**Animation:** Smooth spring animations for card entrances. Donut chart segments animate with a drawing effect. Table rows slide in sequentially. Sidebar highlight uses a morphing animation between items. Gentle parallax on scroll.

**Typography System:** Display: "DM Sans" (700) for headings and large numbers — geometric but warm. Body: "DM Sans" (400/500) for everything else. The single-family approach keeps things cohesive while weight variation creates hierarchy. Size: 44px KPI values, 22px section titles, 14px body, 12px captions.

</text>
<probability>0.08</probability>
</response>
