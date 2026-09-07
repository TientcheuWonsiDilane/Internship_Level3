# Environment Variables

Required and optional environment variables used by the server and frontend.

Server (server/.env or deployment environment):

- `PORT` — port the server listens on (default `5500`).
- `MONGO_URI` — MongoDB connection string (required).
- `JWT_SECRET` — JWT signing secret (required).
- `GITHUB_CLIENT_ID` — OAuth app client id (optional, used for GitHub OAuth login).
- `GITHUB_CLIENT_SECRET` — OAuth app client secret (optional).
- `GITHUB_TOKEN` — Personal access token used for server-side GitHub REST calls and webhooks (optional; without it some features are disabled).
- `GITHUB_WEBHOOK_URL` — Public URL for receiving GitHub webhooks (optional).
- `APP_ENCRYPTION_KEY` — Key for encrypting secrets at rest (optional but recommended).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_SECURE` — SMTP configuration for email (optional).
- `CORS_ORIGIN` — Allowed frontend origin (default `http://localhost:5173`).
- `SOCKET_CORS_ORIGIN` — Optional alternate origin for socket CORS.

Frontend (build-time / runtime as needed):

- `VITE_API_URL` — API base URL when running the frontend outside of the proxy (optional; default proxied during dev).

Notes:
- In development you can set `GITHUB_TOKEN` to a personal access token with `repo` scope to enable sync and webhook registration.
- Keep `JWT_SECRET`, `APP_ENCRYPTION_KEY`, and `GITHUB_CLIENT_SECRET` private and out of git.
