# Akhilesh Bashettiwar · Portfolio

A portfolio with three ways to explore the same content:

| Route | What it is |
|---|---|
| `/` | **3D ride through Hyderabad.** A start screen, then scrolling rides a motorbike from Hussain Sagar past Charminar and through HITEC City, and takes off over Durgam Cheruvu into the clouds. |
| `/terminal` | Terminal-style portfolio (`help`, `projects`, `cd helpdesk-api`, `ride`, …). |
| `/resume` | Plain, printable résumé page. |

All text lives in `src/data/`. The ride, the terminal and the résumé page all read from it, so they always match.

## Run locally

Requires Node 20+ (22 recommended).

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command | Does |
|---|---|
| `npm run build` | Typecheck and build to `dist/` |
| `npm run preview` | Serve the production build on :4173 |
| `npm test` | Unit tests (Vitest): route, sections, stars, camera keys, terminal |
| `npm run e2e` | Browser tests (Playwright), desktop and phone |
| `npm run lint` | ESLint |

First time running e2e locally: `npx playwright install chromium`.

## Push to GitHub and deploy on Vercel

```bash
git init
git add .
git commit -m "Portfolio: Hyderabad 3D ride, terminal and résumé"
git branch -M main
git remote add origin https://github.com/akhi9195/portfolio.git   # create the empty repo on GitHub first
git push -u origin main
```

Then in Vercel: **Add New → Project → import `akhi9195/portfolio`**. Vercel detects Vite; keep the defaults
(build `npm run build`, output `dist`). `vercel.json` already sends `/terminal` and `/resume` to the app.

GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, build and Playwright on every push.

## Before launch: files to add

| File | Notes |
|---|---|
| `public/resume.pdf` | Your résumé. The **Résumé** buttons and `resume` command link here. |
| `public/images/avatar.webp` | Your photo, ~400×400. Until it exists, an "AB" badge is shown. |

`public/og-image.png` (the LinkedIn/Twitter link preview) is already generated.

## Content still to confirm

Marked `TODO` in `src/data/projects.ts`:

- HelpDesk API endpoint count (7, or 4 secured + 1 public)
- LoopMotion demo login (left out on purpose; each video costs money)
- Wild Oasis origin wording (course project?)
- Game Hub: data API name, real challenge, extra features

## How the ride works

Scrolling is the only control: one direction, nothing to steer, so no one gets lost.

| Scroll | Where you are | What shows |
|---|---|---|
| 0–5% | Hussain Sagar at sunset, Buddha statue in the lake | Name and title; Remy waves next to the bike |
| 8–21% | Tank Bund road, 3D "ABOUT ME" letters | Glass panel with bio |
| 25–40% | Charminar | Skill groups appear one by one |
| 44–60% | City street with four billboards (one per role) | Current role; "Full experience & education" |
| 63–85% | HITEC City, Cyber Towers, four gold stars | Each star you ride through unlocks a project card |
| 88–100% | Ramp over Durgam Cheruvu and its cable bridge, up above the clouds | "Let's talk" contact card |

- **Menu** (top right) and the **rail** (right edge) jump to any section. **Plain view** goes to `/resume`.
- **Mouse wheel / trackpad, swipe, or keys** (↓ ↑, Page Down/Up, Space, Home, End) move the ride. They're read
  directly by `RideExperience.tsx` (the page itself doesn't scroll), so it behaves the same in every browser.
- **Light mode:** phones, and any machine averaging under 30 fps in the first seconds, drop shadows, reflections and
  resolution so input stays responsive.
- **Reduced motion:** no smoothing or camera glide. **No WebGL:** the start screen offers the terminal and résumé.
- `/?p=0.7` opens the ride at 70% (handy for reviewing a section).

### Where things live

| File | Controls |
|---|---|
| `src/ride/route.ts` | The route, section ranges, star and billboard positions, landmark positions |
| `src/ride/scene/CameraRig.tsx` | Camera angle for each part of the ride (`CAMERA_KEYS`) |
| `src/ride/scene/Rider.tsx`, `poses.ts` | Remy on the bike, and his poses |
| `src/ride/scene/Landmarks.tsx` | Charminar, Buddha statue, Cyber Towers, Durgam Cheruvu bridge (built in code) |
| `src/ride/scene/City.tsx` | Buildings, trees, Tank Bund lamps and statues (generated from the route) |
| `src/ride/scene/Environment.tsx` | Sunset sky, sun, fog, lakes |
| `src/ride/ui/Overlays.tsx` | All the text panels, menu, rail and project modal |

### Character animation

Four Mixamo clips drive Remy (`public/models/anim-*.glb`, rotations only, 143 KB together):

| Clip | When |
|---|---|
| Waving | Hero, before the visitor scrolls |
| Standing Idle | Once scrolling starts, until he gets on the bike |
| Driving | The whole ride. Hands-on-bars, feet-on-pegs and a forward lean are laid over it in code (`bikePosture` in `Rider.tsx`), because the clip is for a car |
| Flying | From 93.5% scroll: he lets go, the bike drops into the clouds, and he flies to the contact card |

Clips cross-fade as you scroll. To swap a clip, download it from Mixamo for Remy as **FBX, Without Skin, 30 fps**,
convert with `FBX2glTF`, compress with `gltf-transform meshopt`, and replace the matching `anim-*.glb`.

### Models

| File | Source | Licence |
|---|---|---|
| `public/models/remy.glb` | Remy, [Mixamo](https://www.mixamo.com) (Adobe) | Mixamo terms: free for personal and commercial projects; don't redistribute the raw model on its own |
| `public/models/bike.glb` | "Cafe Racer" by [Milin Andrei](https://sketchfab.com/milinam2002), [Sketchfab](https://sketchfab.com/3d-models/cafe-racer-c02dec85ac0541b8ab6dd56098706b50) | CC-BY 4.0: credit required (shown in the site footer) |
| `public/models/letters.typeface.json` | Droid Sans Bold (subset), via three.js | Apache 2.0 (`FONT-NOTICE.txt`) |
| `public/textures/waternormals.jpg` | three.js examples | MIT |

Both models were compressed with `gltf-transform` (Meshopt geometry, WebP textures at 1024 px): Remy 20 MB → 1.5 MB, bike 13 MB → 1 MB.

## Project structure

```
src/
├─ data/          content: profile, skills, experience, education, projects
├─ pages/         HomePage (start screen + ride), TerminalPage, ResumePage
├─ ride/          3D ride: route, store, scene/ (world, landmarks, rider, camera), ui/ (overlays)
├─ components/
│  ├─ sections/   About, Skills, Experience, ProjectCard, Contact (used by the ride modal and /resume)
│  └─ terminal/   Terminal component
├─ terminal/      command engine: parser, registry, suggestions, commands
├─ hooks/, lib/
tests/e2e/        Playwright tests
```
