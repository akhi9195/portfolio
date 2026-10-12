# Akhilesh Bashettiwar · Terminal Portfolio

A terminal-style portfolio built with React, TypeScript, Vite and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run build      # type-check and production build
```

## Edit content

All text lives in **`src/data/content.ts`**. Components never hard-code copy, so update that file and the terminal changes with it.

## Add a command

Add an entry to the `commands` array in `src/terminal/commands.tsx`:

```ts
{ name: 'hello', description: 'Say hi', run: () => <span>Hi!</span> }
```

## Deep links

`/?cmd=cd%20loopmotion` runs that command when the page loads. Useful for sending a recruiter straight to one project.

## Before launch

- [ ] Add the resume PDF as `public/resume.pdf` (the `resume` command links to it)
- [ ] Add project screenshots if you want them shown
- [ ] Confirm the HelpDesk endpoint count and Wild Oasis origin wording in `content.ts`
- [ ] Decide on the LoopMotion demo access (currently "on request", no login published)
- [ ] Check every link on desktop and phone

## Deploy

Push to GitHub, then import the repo in Vercel. Vercel detects Vite automatically: build command `npm run build`, output directory `dist`.
