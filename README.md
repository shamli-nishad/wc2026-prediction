# FIFA World Cup 2026 — Bracket Predictor

A lightweight single-page app where you pick the winner of every knockout match from the Round of 32 through to the Final, then download a personalised bracket card as an image.

---

## Features

- **Name gate** — enter your name before predicting; it appears on every generated card
- **Round-by-round picker** — progress through R32 → R16 → QF → SF → Final one round at a time
- **Live champion preview** — your predicted champion is shown as you pick
- **Bracket card** — a shareable image showing all matchups from R16 onwards, with winners highlighted in green
- **Download** — save your bracket card as a PNG with your name and prediction date
- **Mobile-friendly** — works on phones and tablets

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI |
| TypeScript | Type safety |
| Vite | Dev server & build |
| html2canvas | Image generation & download |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later

### Run locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build for production

```bash
npm run build
```

Output goes to the `dist/` folder. Serve it with any static host or:

```bash
npx serve dist
```

---

## Deploying to Vercel

1. Push the project to a GitHub repository
2. Import the repo on [vercel.com](https://vercel.com)
3. If it lives in a subfolder of a monorepo, set **Root Directory** to `worldcup-bracket`
4. Vercel auto-detects Vite — no further configuration needed
5. Click **Deploy**

---

## Copying to Another Computer

**With Node.js installed on the target machine:**

```bash
# Copy the whole project folder, then:
npm install
npm run dev
```

**Without Node.js (static files only):**

```bash
# Build on your machine first:
npm run build

# Copy the dist/ folder to the target machine.
# Open dist/index.html in a browser, or serve it:
npx serve dist
```

---

## Project Structure

```
worldcup-bracket/
├── src/
│   ├── App.tsx       # Main app — UI, bracket logic, image card
│   ├── data.ts       # R32 match data with dates, venues, bracket slots
│   ├── main.tsx      # React entry point
│   └── index.css     # Global reset & base styles
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Match Data

All 16 Round of 32 matches are hardcoded in `src/data.ts`, sorted by date (Jun 28 – Jul 3). Each match has a `bracketSlot` field that preserves the correct bracket pairings independently of display order, so reordering matches by date does not break the R16/QF/SF/Final progression.

---

## License

MIT
