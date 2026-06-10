<div align="center">

# >_ TERMREF

**Curated terminal cheat sheet reference**

Pick a technology. Hit load. Get a clean, downloadable reference card — instantly.

<img src="./docs/termref-empty-state.png" alt="Termref — select a technology and load a cheat sheet" width="900" />

<br><br>

[![Next.js](https://img.shields.io/badge/Next.js-16-000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-00e5a0?style=for-the-badge)](LICENSE)

</div>

---

## Features

<div align="center">

<img src="./docs/termref-aws.png" alt="Termref showing an AWS CLI cheat sheet" width="900" />

<br><br>

</div>

- **15 technologies** — Git, Docker, Kubernetes, Python, Bash, AWS CLI, Terraform, Vim, dbt, and more
- **Category filtering** — browse by DevOps, Language, Cloud, Data, etc.
- **Instant loading** — select a tool, press Load, get a structured cheat sheet immediately
- **Download as .TXT or .MD** — export for offline use or paste into docs
- **Pre-built content** — cheat sheets are stored as static JSON, bundled at build time
- **Terminal-inspired UI** — dark theme, monospace fonts, zero fluff

## Supported Technologies

<p>
  <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white" alt="Git" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white" alt="Kubernetes" />
  <img src="https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white" alt="npm" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Bash-4EAA25?style=flat-square&logo=gnubash&logoColor=white" alt="Bash" />
  <img src="https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black" alt="Linux" />
  <img src="https://img.shields.io/badge/AWS_CLI-232F3E?style=flat-square&logo=amazonwebservices&logoColor=white" alt="AWS CLI" />
  <img src="https://img.shields.io/badge/Terraform-7B42BC?style=flat-square&logo=terraform&logoColor=white" alt="Terraform" />
  <img src="https://img.shields.io/badge/Vim-019733?style=flat-square&logo=vim&logoColor=white" alt="Vim" />
  <img src="https://img.shields.io/badge/Rust-000?style=flat-square&logo=rust&logoColor=white" alt="Rust" />
  <img src="https://img.shields.io/badge/dbt-FF694B?style=flat-square&logo=dbt&logoColor=white" alt="dbt" />
  <img src="https://img.shields.io/badge/Airflow-017CEE?style=flat-square&logo=apacheairflow&logoColor=white" alt="Airflow" />
  <img src="https://img.shields.io/badge/Snowflake-29B5E8?style=flat-square&logo=snowflake&logoColor=white" alt="Snowflake" />
  <img src="https://img.shields.io/badge/Next.js-000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
</p>

## Tech Stack

| Layer | Tech | |
|-------|------|---|
| Framework | Next.js 16 (App Router) | ![Next.js](https://img.shields.io/badge/-Next.js-000?style=flat-square&logo=nextdotjs&logoColor=white) |
| UI | React 19 + custom CSS | ![React](https://img.shields.io/badge/-React-61dafb?style=flat-square&logo=react&logoColor=black) |
| Fonts | JetBrains Mono, Space Mono | ![Google Fonts](https://img.shields.io/badge/-Google_Fonts-4285F4?style=flat-square&logo=googlefonts&logoColor=white) |
| Data | Static JSON cheat sheets | |
| Language | TypeScript 5 | ![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white) |
| Package Manager | pnpm | ![pnpm](https://img.shields.io/badge/-pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white) |

## Getting Started

### Prerequisites

- ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
- ![pnpm](https://img.shields.io/badge/pnpm-latest-F69220?style=flat-square&logo=pnpm&logoColor=white) (or npm / yarn)

No environment variables or API keys are required.

### Setup

```bash
git clone https://github.com/your-username/termref.git
cd termref
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
termref/
├── app/
│   ├── components/
│   │   └── termref-app.tsx      # Main client component
│   ├── globals.css              # Reset
│   ├── termref.css              # Terminal theme styles
│   ├── layout.tsx               # Root layout + fonts
│   └── page.tsx                 # Entry page
├── data/cheatsheets/            # Pre-built JSON cheat sheets (one per tech)
├── docs/
│   ├── termref-aws.png          # README screenshot
│   └── termref-empty-state.png  # README screenshot
├── lib/
│   ├── cheat-sheet.ts           # Types + text/markdown formatters
│   ├── cheatsheets.ts           # Static sheet loader
│   └── technologies.ts          # Tech list + validators
└── package.json
```

## Adding or Updating Cheat Sheets

Each technology has a JSON file in `data/cheatsheets/` (e.g. `git.json`). To add a new tech:

1. Add an entry to `lib/technologies.ts`
2. Create `data/cheatsheets/<id>.json` following the existing format
3. Import it in `lib/cheatsheets.ts`

The app validates at build time that every technology has a matching sheet.

---

<div align="center">

**Built with** ![Next.js](https://img.shields.io/badge/-Next.js-000?style=flat-square&logo=nextdotjs&logoColor=white)

MIT License

</div>
