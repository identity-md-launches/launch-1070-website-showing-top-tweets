# IdentityMD Signal design system

## Overview

This is a community reading list about IdentityMD for people following AI agents, builders, and ecosystem conversations. The implemented direction is a dark-green signal station: a persistent desktop navigation column, one illustrated hero, a readable ranked feed, and a supporting information rail. Pepe scouts carry AI interfaces and a data scanner. The page prioritizes finding, reading, and saving posts; there are no token or wallet interactions.

Source of truth: `src/style.css`, `src/App.tsx`, `src/icons.tsx`, and `src/data.ts`. The hero composition is specific to this page; the surface, type, focus, and control patterns can be reused.

## Colors

`src/style.css:8` defines hex primitives and semantic aliases. The site deliberately has one dark theme.

| Semantic token | Resolved value | Role |
| --- | --- | --- |
| `--color-page` | `#0b1511` | Page canvas |
| `--color-sidebar` | `#0e1913` | Navigation background |
| `--color-surface` | `#101e17` | Tweet and rail cards; dialog |
| `--color-elevated` | `#14241c` | Stats and toast surface |
| `--color-hover` | `#1b3023` | Neutral control hover |
| `--color-border` | `#273c2e` | Structural separators and card boundaries |
| `--color-control-border` | `#587260` | Visible field/button boundaries |
| `--color-text` | `#edf3e9` | Headings and primary copy |
| `--color-secondary` | `#bdd0bf` | Card body and supporting text |
| `--color-muted` | `#9bb0a0` | Metadata and secondary controls |
| `--color-accent` | `#c4f879` | Primary CTA, active navigation/filter, bookmark state |
| `--color-on-accent` | `#142013` | Text on the lime primary action |
| `--color-focus` | `#d7ff9e` | 2px focus outline, offset 4px |
| `--color-selection` | `#263e21` | Selected navigation and filter fill |

The field note is a documented component exception: background `#20301b`, border `#3d512d`, heading `#e1edce`, body `#c1cdb4`, annotation `#c4d8a4`. Avatars use moss, lime, sand, blue, and rose class variants to distinguish authors; these colors do not imply identity verification or status. Hero shading uses `#102014` with a directional alpha gradient. No ordinary reading text sits directly on the bright part of the artwork.

Measured solid-surface pairs: card heading 15.24:1, card body 10.60:1, muted author 7.47:1, neutral topic 11.45:1, selected topic 9.51:1, CTA 13.69:1, field-note body 8.44:1. Measurements and artwork-related limitations are in `artifacts/browser-results.json` and `artifacts/validation.md`.

## Typography

The locally bundled Manrope Latin variable font is `src/assets/manrope-latin.woff2`, with a declared 200–800 weight range and normal style. The UI uses 400, 500, 600, 700, and 800. Its stack is `Manrope, Arial, sans-serif`; `font-display: swap` and root antialiasing are enabled. The “A” avatar intentionally uses italic Georgia; small ranking/coordinate labels use a system monospace font. No runtime font request leaves the host.

| Role | Implemented size / behavior |
| --- | --- |
| Hero h1 | `clamp(2.25rem, 3.7vw, 3.5rem)`, weight 800, line-height 1.07, −2px tracking; 44px at ≤1020, 42px at ≤740, 40px at ≤420, 34px/−1.5px at ≤360 |
| Feed h2 | 1.375rem (22px), weight 700, −0.65px tracking |
| Rail headings | 0.875rem (14px), weight 600 |
| Field-note h2 | 25px, line-height 1.25 |
| Card h3 | 1rem (16px), weight 600, line-height 1.5; 17px on mobile |
| Card paragraphs | 0.875rem (14px), line-height 1.8, max 68ch; 15px on mobile |
| Metadata/controls | Predominantly 12–14px, weight ≥400; functional labels have a 12px floor except compact 11px mobile author metadata |
| Eyebrows/technical labels | 9–10px uppercase with expanded tracking; decorative hero coordinates 8px, 6px at ≤420 |
| Search | 12px desktop, 16px at ≤740 to avoid mobile input zoom |
| Dialog | h2 27px (24px ≤420); prose 14px/1.8; subheadings 16px |

Heading wrapping uses `balance`; card titles and prose use `pretty`. Text remains selectable. No post content is line-clamped. Numbers use tabular forms where appropriate. Root-font 200% enlargement was checked for horizontal overflow; it is not equivalent to native browser zoom or doubling every pixel-sized label.

## Layout

The declared spacing steps are 4, 8, 12, 16, 20, 24, and 32px. Components use corresponding direct dimensions with deliberate page-specific adjustments. Reusable relationships: close icon/text groups (6–12px), card inset (20–21px desktop, 16px narrow mobile), content groups (18–24px), and page gutters (38px desktop, 25px intermediate, 20px mobile, 16px narrow).

The main wrapper has `max-width: 1500px`. Desktop uses a fixed 222px sidebar and a 276px right rail separated from the flexible feed by 24px. Cards and feed tracks use `min-width: 0`. The navigation sidebar has its own vertical overflow; the reading page scrolls normally. No sticky feed toolbar obscures content.

| Breakpoint | Final behavior |
| --- | --- |
| ≥1550px | Hero padding expands, minimum hero height 340px; optional stat annotations appear |
| ≤1190px | Sidebar 198px; page gutters 25px; right rail 246px with 18px grid gap |
| ≤1020px | Right rail hidden; feed fills available width; equivalent topic/source controls remain in the feed/navigation |
| ≤740px | Sidebar becomes a normal-flow brand/nav header; 16px search; single-column content; larger card text |
| ≤420px | 16px gutters; topic chips wrap; smaller hero crop and text measure; compact stats and metadata; header count hidden but Saved count remains in feed tabs |
| ≤360px | Hero headline reduces to 34px to preserve its two-line composition |

Rendered checks covered 320, 390, 768, 1020, and 1440px with no horizontal overflow. Screenshots cover 320, 390, 768, and 1440px plus the mobile feed. The interface is English/LTR; no RTL or translated layout has been validated.

## Elevation & Depth

The normal interface is flat: restrained borders define cards, navigation, and sections; tonal steps separate surfaces. Only a toast (`0 8px 30px #0006`) and dialog (`0 24px 80px #0008`) use elevation shadows. The dialog backdrop is `#020a07c9` with a 4px blur. Sidebar stacking is 5, toast 10, skip link 20; the native modal dialog occupies the browser top layer. The background becomes inert through `showModal()`, and body scrolling is locked while open.

## Shapes

Hero radius is `--radius-card: 12px`; controls use `--radius-control: 7px` or 6px for filters/actions. Tweet/rail/note cards are 10px; the dialog is 16px. Circular monogram avatars have a subtle white 10% inset outline. Boundaries are usually 1px. Hover and selected states remain visibly distinct; focus never depends on a color fill alone.

## Components

- **`PostCard` / `Avatar` (`src/App.tsx`)**: internal components for sourced summaries and author monograms. PostCard accepts `post`, current list `rank`, boolean `saved`, `onSave`, and `onDetails`. Its bookmark is a native button with `aria-pressed`; view counts open source notes. A source link is an actual external anchor and remains separate from the bookmark.
- **`Icon` / `BrandMark` (`src/icons.tsx`)**: one geometric SVG icon family. `Icon` accepts `name` and optional `size` (default 20), uses `currentColor`, 1.7px strokes, and hides decorative SVGs from the accessibility tree. Button labels provide meaning.
- **Navigation pattern (`src/App.tsx`)**: native hash anchors with `aria-current`; navigation clears prior filters so the destination has a useful initial state. Browser Back updates the feed view. On mobile, the same main navigation becomes a wrapping top row.
- **Search/filter/sort pattern**: a real labeled search input; grouped native filter buttons with `aria-pressed`; a native labeled select. Dynamic counts use a persistent polite status region. Search and topics combine; a no-results state offers “Clear filters” and returns focus to search.
- **Dialog pattern**: native `dialog`, contextual heading, autofocus on Close, explicit Tab/Shift+Tab cycling, native Escape/trigger-focus restoration, backdrop dismissal. Width is `min(570px, 100% - 32px)`, maximum height 85dvh. Content scrolls without scrolling the underlying page.
- **Notifications/storage**: persistent polite toast until dismissed. Failed storage writes keep session state and explain that it will not persist. Malformed stored values are filtered through `readSaved` in `src/data.ts`.
- **Primary/secondary action styles**: `.primary-button` is the one lime emphasis action; `.secondary-button` is a bordered neutral recovery/source action. Hover styles are pointer-capability guarded. Color/transform transitions are 120ms ease-out only with `prefers-reduced-motion: no-preference`; pressed primary/secondary/icon buttons scale to 0.96. No entrance animations or loading skeletons: the collection is bundled synchronously.

## Do's and Don'ts

- Reuse semantic color roles; keep border colors out of text roles. Preserve the measured contrast relationships when adjusting surfaces.
- Keep the editorial summary label, snapshot date, source note, and distinction between direct X links and source timelines.
- Use actual anchors for destinations and buttons for state changes. Preserve names, visible focus, the skip link, and explicit selected states.
- Keep unknown engagement absent. Never add invented status IDs, fake live activity, or implied verification badges.
- Keep image/font assets local. Preserve the relative build base and hash navigation.
- To add a related view, reuse the app shell, feed section spacing, PostCard, Icon, and neutral surfaces. Use a hash destination, provide a descriptive h2, ensure equivalent mobile access, and rerun the responsive/keyboard checks. A new view does not need another hero or a second lime CTA.
