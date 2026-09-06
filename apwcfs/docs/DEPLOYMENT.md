# Deployment guide

This guide is for contributors and operators deploying the current APWCFS frontend. The deployable application is the Vite/React project at the repository root (`apwcfs/`). The `server/` directory is not deployable yet: it contains dependencies only and currently has no entrypoint or start script.

## 1. Get the repository

```bash
git clone <repository-url>
cd apwcfs
npm ci
```

Use `npm ci` in CI and deployment environments because it installs the versions recorded in `package-lock.json`. Use `npm install` when intentionally changing dependencies.

## 2. Configure environment variables

Copy the template and fill in the values locally:

```bash
cp .env.example .env
```

The file must contain:

```env
VITE_WAQI_API_KEY=your-waqi-token
VITE_GEMINI_API_KEY=your-gemini-key
```

### Required and optional values

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_WAQI_API_KEY` | For station-backed data | Authenticates nearest-station requests to WAQI. Without it, dashboard data loading fails. |
| `VITE_GEMINI_API_KEY` | No | Enables generated explanations. If empty, the app uses its local fallback explanation. |

`VITE_` variables are compiled into browser JavaScript by Vite. They are not secret after deployment. Do not put an administrative, billing, or privileged token in `.env`; proxy those integrations through a backend instead. Keep `.env` untracked. Commit only `.env.example` with placeholder values.

## 3. Test before deployment

```bash
npm run lint
npm run build
```

The build output is written to `dist/`. Check the app manually with:

```bash
npm run preview
```

Verify `/`, `/science`, and `/dashboard`, then test a map selection and the explanation flow. Also check the browser network panel for blocked API calls and stale or missing data states.

## 4. Deploy as a static site

Any static host that supports a Node build and SPA fallback can serve the current frontend. Configure:

| Setting | Value |
| --- | --- |
| Root directory | `apwcfs/` if deploying from the parent repository |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 18 or newer |
| SPA fallback | Rewrite unknown paths to `/index.html` |

Set the environment variables in the host's project settings before building. Because Vite injects them at build time, changing a variable requires a new deployment.

### Common host configuration

- **Vercel**: framework preset `Vite`, build `npm run build`, output `dist`, and add a rewrite from `/(.*)` to `/index.html` if direct route refreshes return 404.
- **Netlify**: build `npm run build`, publish `dist`, and add `public/_redirects` containing `/* /index.html 200` if history routes are used.
- **GitHub Pages**: configure an SPA fallback or use hash-based routing before publishing. Direct refreshes of `/science` and `/dashboard` otherwise return 404.
- **Nginx or a VPS**: serve `dist/` and use `try_files $uri $uri/ /index.html;` for the site location.

## 5. Production security

The current prototype calls third-party APIs from the browser. For a public production deployment:

1. Move WAQI and Gemini requests to a server-side API.
2. Store provider keys in the host's secret manager, not in the repository or image.
3. Add rate limits, caching, origin restrictions, and timeout handling.
4. Return source, timestamp, units, and observed/estimated/modelled status from the API.
5. Do not expose raw provider errors or upstream credentials in the UI.

Until that work is complete, treat the static deployment as a demo or prototype deployment and use provider keys with appropriate restrictions.

## 6. Backend status

Do not run `npm start` from `server/`: no start script or application entrypoint exists yet. When the backend is implemented, document its runtime, required variables, health check, migration process, and deployment separately before using it in production.

## Troubleshooting

- **`vite: Permission denied`**: run `npm install` again, then retry. The local executable shims may have incorrect permissions in a copied `node_modules` directory.
- **Missing native Rolldown binding**: remove the local `node_modules` directory and run `npm ci` on the target platform so optional dependencies are installed for that platform.
- **Blank page after deployment**: confirm the host rewrites application routes to `/index.html` and inspect the browser console for failed module or API requests.
- **Dashboard cannot load data**: confirm `VITE_WAQI_API_KEY` was set before the build and that the provider allows requests from the deployed origin.
