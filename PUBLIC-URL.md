# Public HTTPS URL for the Local Project

Run the whole application on your own desktop and share **one public HTTPS URL** with anyone
(phone, tablet, laptop) — without deploying the code to Vercel, Render, or any other host.

Your desktop must stay switched on and online for the URL to work.

---

## Architecture

```
   Anyone on the internet
            │
            │  HTTPS  (Cloudflare Tunnel, no inbound ports opened)
            ▼
   https://<random>.trycloudflare.com
            │
            │  cloudflared forwards to
            ▼
   127.0.0.1:5173   ── Vite dev server (public entry point)
            │
            ├── /                → serves the React frontend
            └── /api/*           → reverse-proxied to
                                      127.0.0.1:3000  (NestJS backend)
                                            │
                                            ▼
                                 127.0.0.1:27017  (MongoDB)
```

**Only one port (5173) is published.** The Vite dev server is already a same-origin reverse
proxy for `/api`, so:

- One public hostname for the whole app — no CORS preflight, no second URL to share
- The backend port (3000) and the database port (27017) are **never exposed**
- Authentication, file paths, cookies and the `/api` prefix all stay exactly as they are

---

## Quick start

```bat
start-public-project.bat
```

The script starts everything, waits for the frontend to answer, opens the tunnel, and prints
the public URL. It stays open so you can copy the link.

To stop everything:

```bat
stop-public-project.bat
```

---

## What the startup script does

| Step | Action |
|---|---|
| 1 | Verifies Node.js, `cloudflared`, and installs `npm` deps if missing |
| 2 | Frees ports 3000 and 5173 |
| 3 | Checks MongoDB is listening on 27017 (warns but continues if not) |
| 4 | Starts the NestJS backend on `0.0.0.0:3000` |
| 5 | Starts the Vite frontend on `0.0.0.0:5173` |
| 6 | Starts `cloudflared tunnel --url http://127.0.0.1:5173` |
| 7 | Polls the tunnel log and prints the `https://….trycloudflare.com` URL |

Logs are written to `.logs/`.

---

## Installing cloudflared (one-time)

The binary is downloaded into `.tools/` inside this project — **no admin rights, no
system-wide install, nothing added to your PATH**.

```bat
tools\setup-cloudflared.bat
```

Or manually: <https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/>

---

## Files created / modified for this setup

| File | Purpose |
|---|---|
| `start-public-project.bat` | **New** — starts backend, frontend and tunnel; prints the public URL |
| `stop-public-project.bat` | **New** — stops all three (leaves MongoDB running) |
| `tools/setup-cloudflared.bat` | **New** — downloads `cloudflared` into `.tools/` |
| `frontend/vite.config.ts` | **Modified** — `host: true`, `strictPort`, `allowedHosts: true` (Vite 5 blocks unknown Host headers, which breaks tunnels) |
| `frontend/.env` | **New** — leaves `VITE_API_URL` unset so the client uses the relative `/api` path (same origin) |
| `backend/.env` | **New** — local MongoDB URI, a random `JWT_SECRET`, allowed origins |
| `backend/src/main.ts` | **Modified** — CORS no longer raises a 500 for unknown origins (it would break tunnelled requests); binds `0.0.0.0`; graceful shutdown |
| `.gitignore` | **Modified** — excludes `.env`, `.tools/`, `.logs/` so secrets and binaries are never committed |

Nothing was overwritten without a backup: `frontend/.env` and `backend/.env` did not exist
before, and any pre-existing file would have been copied to `*.backup-<timestamp>`.

---

## Environment configuration

### `backend/.env`

```
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/sai_prasad_driving_school
JWT_SECRET=<random 64-char value, generated locally>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
BUSINESS_TIMEZONE=Asia/Kolkata
RATE_LIMIT_MAX=200
```

`CLIENT_URL` lists the browser origins allowed to call the API directly. It does **not** need
the tunnel hostname, because tunnelled traffic is same-origin and never goes through a CORS
check. If you ever call the backend directly from a different domain, add that origin here.

### `frontend/.env`

`VITE_API_URL` is intentionally **unset**. The client then uses the relative path `/api`,
which the Vite proxy forwards to the backend. Same origin → no CORS, one URL.

---

## Security notes — please read

- **Anyone with the public URL can reach the public pages** (home, courses, services, contact,
  the demo-booking form) and the student portal login page. That is the point of a public URL.
- **The admin panel is protected by authentication** — a JWT, bcrypt-hashed passwords, and
  role-based access control. No credentials are exposed, and no security control was disabled
  to make this work.
- **The database is not published.** MongoDB listens on `127.0.0.1` only and is unreachable
  from the internet.
- **The backend port is not published.** Only 5173 is tunneled; the API is reachable solely
  through the authenticated-by-nature frontend origin.
- **`JWT_SECRET` lives only in `backend/.env`**, which is git-ignored. It is never sent to the
  browser and never printed.
- **Rate limiting** is active on the backend (`RATE_LIMIT_MAX` per minute per IP).
- The tunnel URL is **temporary and changes every time** you restart the tunnel. For a
  permanent hostname, create a named tunnel with Cloudflare (see below).
- Anyone who obtains the URL can submit demo-booking and service-request enquiries. Treat
  the shared link like a public poster and moderate the inbox.

---

## Permanent URL (optional)

A quick tunnel gets a random `trycloudflare.com` name that changes on every restart. For a
fixed hostname, use a named tunnel:

```bat
cloudflared.exe login
cloudflared.exe tunnel create sai-prasad
cloudflared.exe tunnel route dns sai-prasad driving.yourdomain.com
```

Then point it at the frontend and add the resulting `config.yml`:

```yaml
tunnel: <tunnel-id>
credentials-file: C:\Users\<you>\.cloudflared\<tunnel-id>.json
ingress:
  - hostname: driving.yourdomain.com
    service: http://127.0.0.1:5173
  - service: http_status:404
```

```bat
cloudflared.exe tunnel run sai-prasad
```

Remember to add `https://driving.yourdomain.com` to `CLIENT_URL` in `backend/.env`.

---

## Free-tier limitations

| Limitation | Impact |
|---|---|
| The URL changes on every tunnel restart | Share the new link each time, or use a named tunnel |
| The tunnel only lives while `cloudflared` runs | Your desktop must stay awake — disable sleep in **Power Settings → Screen & sleep → When plugged in, put the PC to sleep: Never** |
| No uptime monitoring on the free plan | The URL simply stops resolving if the tunnel or PC goes down |
| Cloudflare may rate-limit very high traffic | Normal usage is fine |

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `Blocked request. This host is not allowed.` | Vite rejected the tunnel's Host header | `allowedHosts: true` is set in `frontend/vite.config.ts` — confirm the dev server restarted after the change |
| Frontend loads but the API 404s | The tunnel points at the wrong port | The tunnel must target **5173** (not 3000) |
| `MongooseServerSelectionError` | MongoDB is not running | Start MongoDB; confirm port 27017 is listening |
| Page works locally but not through the tunnel | Frontend bound to `127.0.0.1` only | `host: true` in `frontend/vite.config.ts` (already set) |
| CORS error in the browser console | A different origin called the API directly | Add that origin to `CLIENT_URL` in `backend/.env` and restart the backend |
| Tunnel URL never appears | `cloudflared` failed to start | Check the **"Sai Prasad Tunnel"** window and `.logs/tunnel.log` |
| Cloudflare asks for a login | A named tunnel is being used | Quick tunnels (`tunnel --url`) need no login |
