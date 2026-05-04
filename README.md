# OMP Session Frontend

React/Vite frontend for a local read-only OMP session viewer.

This UI talks to the backend API from `OMP-session-backend` and provides:

- Global OMP session list and fuzzy search
- Session details with readable message timeline
- Copyable `omp --resume <id>` commands
- Message-count filters and optional zero-message sessions
- Collapsed tool-result output by default
- Command palette via `cmdk`

## Requirements

- Node-compatible runtime with `pnpm`
- Backend API running locally, default: `http://127.0.0.1:8080`

## Install

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Open `http://localhost:5173`.

The Vite dev server proxies `/api` requests to the backend.

## Checks

```bash
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

Or run the full check pipeline:

```bash
pnpm check
```

## Build

```bash
pnpm build
```

Static output is written to `dist/`.

## Related repository

Backend API: https://github.com/ValTM/OMP-session-backend
