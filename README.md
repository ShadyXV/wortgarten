# Wortgarten

Wortgarten is a German vocabulary learning app with sentence-based study, audio playback, spaced-repetition reviews, progress analytics, and a searchable sentence manager.

The project pairs a premium dark botanical notebook interface with a practical FSRS-powered review system. It is built as a local-first full-stack TypeScript app: a Vite/React client talks to an Express API backed by SQLite.

## Features

- Learn new German sentences in small randomized batches.
- Reveal translations only when ready, then add cards to the review queue.
- Review due cards with FSRS ratings: Again, Hard, Good, and Easy.
- Start targeted review sessions by difficulty band.
- Practice random sentences from the full dataset.
- Track retention, deck completion, upcoming reviews, and leech cards.
- Search, filter, edit, and activate sentences from the database manager.
- Play bundled pronunciation audio for supported sentences.
- Run the app locally with no hosted service dependency.

## Tech Stack

| Area | Technology |
| --- | --- |
| Client | React 19, TypeScript, Vite, React Router |
| Styling | Tailwind CSS 4 with custom Wortgarten design tokens |
| UI | Lucide icons, Radix Dialog primitives, Recharts |
| Server | Express 5, TypeScript, ts-node-dev |
| Database | SQLite via better-sqlite3 |
| Spaced repetition | ts-fsrs |

## Project Structure

```text
.
├── client/                # Vite React application
│   ├── public/            # favicon and bundled audio assets
│   └── src/
│       ├── components/    # shared UI components
│       ├── views/         # Learn, Review, Practice, Stats, Manage
│       ├── api.ts         # client API wrapper
│       └── index.css      # Wortgarten visual system
├── server/                # Express API
│   ├── data/app_data.db   # SQLite data store
│   └── src/               # API routes and database setup
└── package.json           # workspace convenience scripts
```

## Getting Started

### Prerequisites

- Node.js and npm
- A local clone of this repository

The app is designed to run locally. The checked-in SQLite database and bundled audio files provide the learning content used by the client and server.

### Install

```bash
npm run install-all
```

This installs dependencies for both `server/` and `client/`.

### Run in Development

```bash
npm run dev
```

The root dev script starts both processes:

- API server: `http://localhost:3001`
- Web app: `http://localhost:3000`

Open `http://localhost:3000` in your browser. The client defaults to `http://localhost:3001/api` for API calls.

### Client API URL

To point the client at a different API base URL, create `client/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

See [client/.env.example](client/.env.example).

## Available Scripts

From the repository root:

```bash
npm run install-all
npm run dev
```

From `client/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

From `server/`:

```bash
npm run dev
npm run build
npm run start
```

## API Overview

The server exposes a JSON API under `/api`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/api/learn` | Fetch a small batch of not-started sentences |
| `PUT` | `/api/learn/:id` | Add a sentence to the review queue |
| `GET` | `/api/random` | Fetch one random sentence |
| `GET` | `/api/test/counts` | Fetch review setup counts by mode |
| `GET` | `/api/test/due?mode=all` | Fetch due review cards |
| `POST` | `/api/test/review` | Submit an FSRS review rating |
| `GET` | `/api/sentences` | Search, filter, and paginate sentences |
| `PUT` | `/api/sentences/:id` | Edit sentence text and review metadata |
| `GET` | `/api/stats/overview` | Fetch deck totals and learning status |
| `GET` | `/api/stats/retention` | Fetch global retention metrics |
| `GET` | `/api/stats/forecast` | Fetch upcoming review counts |
| `GET` | `/api/stats/leeches` | Fetch cards with the most lapses |
| `GET` | `/api/stats/heatmap` | Fetch review activity by day |

Review ratings use the FSRS convention:

| Rating | Label |
| --- | --- |
| `1` | Again |
| `2` | Hard |
| `3` | Good |
| `4` | Easy |

## Data Notes

- The SQLite database lives at `server/data/app_data.db`.
- `review_logs` is created automatically if missing.
- Audio files are served from `client/public/audio` and referenced by sentence records.
- Review state is stored on each sentence with FSRS fields such as due date, stability, difficulty, repetitions, and lapses.

Because the database is a local file, make a backup before doing destructive data experiments or large import work.

## Development Guidelines

- Keep client behavior and server contracts aligned through `client/src/api.ts`.
- Prefer reusable design classes in `client/src/index.css` for visual work.
- Keep routes stable unless a change intentionally alters navigation.
- Use server-side validation for API mutations.
- Run the client build and lint before opening a pull request.

Recommended checks:

```bash
npm run build --prefix client
npm run lint --prefix client
npm run build --prefix server
```

## Contributing

Contributions are welcome. Good first areas to improve include:

- Better import/export tools for sentence data
- More analytics around review history
- Additional accessibility checks
- Test coverage for API validation and FSRS review updates
- Packaging the app for easier local deployment

Before submitting a change:

1. Keep the change focused.
2. Include screenshots for UI changes.
3. Document any data or API changes.
4. Run the relevant build and lint checks.

## License

The server package currently declares the ISC license. If this repository is published as a standalone open-source project, add a root `LICENSE` file so the license is explicit for the whole project.
