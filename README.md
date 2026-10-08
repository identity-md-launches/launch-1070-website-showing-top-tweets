# IdentityMD Signal

A responsive, dark-green reading room for the IdentityMD conversation, with AI-equipped Pepe artwork. Built with React, TypeScript, and Vite. The complete static site is in **`dist/`** and is delivered alongside its source and lockfile.

## Run locally

Requires Node.js 22.12+ and npm. No environment file, API key, wallet, or backend is needed.

```sh
npm ci
npm run dev
```

Vite prints the development URL. For the production version:

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Open the preview URL printed by Vite. Serve the site over HTTP; opening the HTML through `file://` is not supported by its JavaScript modules.

## Publish

Upload **the contents of `dist/`**, including `assets/` and `favicon.svg`, to any static host. The publisher must serve the delivered export; rebuilding is optional unless source changes. Vite uses `base: './'`, and runtime image paths are relative. The same export works at a domain root, an ENS/IPFS gateway subpath, or a directory such as `/signal/`.

Navigation uses `#feed` and `#saved`, so server rewrite rules are unnecessary. Keep the trailing slash on directory URLs. No secrets, API service, runtime CDN, webfont provider, or analytics are contacted by the app. Source/profile links leave the site and require internet access.

After editing source, rerun typecheck, tests, and build. Include the entire updated `dist/` in the submission along with `src/`, `public/`, `scripts/`, `artifacts/`, the package manifest/lockfile, configuration, and root documentation. Never include `node_modules`, npm caches, archives, or a submodule. The assignment prohibits writes to `.git`, so this worker supplies ready-to-submit files without creating a Git commit.

## What works

- Search authors, handles, titles, summaries, and topics; `/` focuses search.
- Combine search with four topic filters, clear an empty search, and sort by editorial order, available views, or author.
- Save and unsave tweets, visit the saved collection, and retain bookmarks across reloads. If browser storage is blocked, saves last for the current visit and a persistent message explains the limitation.
- Read source context in keyboard-accessible dialogs, follow identified X posts, or open the indexed source when an exact permalink is unavailable.
- Responsive sidebar, wrapping controls, a single-column mobile feed, and a skip link.

## Content and updates

The eight cards are **editorial summaries of public posts**, collected October 9, 2026. This is an editorial “top picks” collection, not a live, exhaustive, or algorithmically ranked X feed. No posts, handles, status IDs, or engagement figures were invented. Direct X reads returned 403; indexed mirrors and reporting supplied the summaries. Five cards link to a source timeline because an exact original permalink was unavailable. Three have identified X status links.

View counts are source-reported approximations, may be stale, and are absent where unknown. They are never inferred from a different post. Snapshot counts and community opinions have not been independently audited. Read the [source register](artifacts/sources.md) and the site's About dialog for details.

Edit `src/data.ts` to update the collection. Each item needs a stable unique `id`, author, handle, title, original editorial summary, topic, source URL/name, and source context. Supply `xUrl` only for a known post; omit `views` if unavailable. Keep existing IDs when updating so bookmarks survive. Update `snapshotDate` and the visible snapshot date in `src/App.tsx`, then rebuild and validate. The current content-integrity test deliberately expects this eight-post, four-topic collection; update those expectations with a deliberate editorial expansion.

## Validation

Actual worker results on October 9, 2026 (Taipei):

| Command | Result |
| --- | --- |
| `npm install --prefix /tmp/identitymd-signal-build --no-audit --no-fund` (cache also in `/tmp`) | Dependencies installed; lockfile returned to repository. |
| `npm --prefix /tmp/identitymd-signal-build run typecheck` | Passed, exit 0. |
| `npm --prefix /tmp/identitymd-signal-build test` | Passed, exit 0: data integrity, search, combined filters, all sorting modes, saved selection, malformed storage. |
| `npm --prefix /tmp/identitymd-signal-build run build` | Passed, exit 0: 31 modules, relative static export. |
| `CHROMIUM_PATH=/opt/ms-playwright/chromium-1247/chrome-linux64/chrome npm --prefix /tmp/identitymd-signal-build run test:browser` | Passed, exit 0: 11 groups of production interaction/layout/accessibility checks. |
| `npm run check:bundle` | Passed; byte inventory recorded in `artifacts/bundle-results.json`, below 8 MiB. |

To respect the repository's protected dependency paths, the worker copied source/configuration into `/tmp/identitymd-signal-build`, installed and built there, then copied the completed export and evidence back. No repository dependency directory was created. Normal local development can use the first commands above.

The reproducible browser check starts its own bounded server, serves the actual export under `/preview/`, and closes its server/browser in `finally`:

```sh
npx playwright install chromium
npm run test:browser
npm run check:bundle
```

Alternatively set `CHROMIUM_PATH` to a compatible installed Chromium executable. Browser checks write evidence into `artifacts/`; they are never needed to serve the export. The build is independent of `test/scratch/` and the assignment input files.

The worker also used the supplied browser tools to inspect desktop/mobile screenshots and exercise controls. No horizontal overflow occurred at 320, 390, 768, 1020, and 1440 CSS pixels. No local resource or console errors were observed. Axe reported zero A/AA violations in the tested feed and dialog states. Seven measured text/background pairs passed 4.5:1. These checks are worker evidence, not independent certification or a claim of universal accessibility.

**Limits:** Chromium only; no real-device, screen-reader, browser-native 200% zoom, RTL, localization, or slow-motion animation-panel session. Root font enlargement was tested separately. Contrast over the hero artwork was visually reviewed but not exhaustively measured. External source availability and current X metrics were not validated. See the consolidated [six-domain review](artifacts/validation.md), [machine-readable browser results](artifacts/browser-results.json), and [design system](DESIGN.md).

## Submission size

`scripts/check-bundle.mjs` inventories explicit deliverable paths and checks relative export entry points. `artifacts/bundle-results.json` records the final byte count, including itself. The uncompressed file total is a conservative budget measure; no dependency directories or redundant build hashes are included. No ignore file was created or changed, so no ignore-path budget is consumed. Scratch tests and browser intermediate captures are excluded and cleaned from the deliverable.

## Design and attribution

See [DESIGN.md](DESIGN.md) for implemented tokens, typography, components, and breakpoints. The pinned Better Interface guide informed construction and the six-domain review. [Third-party notices](THIRD_PARTY_NOTICES.md) preserve design-guide, font, and runtime attributions. [Artwork provenance](artifacts/asset-provenance.md) contains the built-in imagegen prompt and the final local asset path.
