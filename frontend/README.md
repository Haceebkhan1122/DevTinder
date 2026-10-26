# devTinder Web

Next.js 16 frontend for the devTinder backend (`../backend`).

## Run

```bash
nvm use 22
npm install
npm run dev        # http://localhost:5173
```

The backend must be running on `http://localhost:7777` (`npm run dev` in `../backend`).
Port 5173 matches the backend's `FRONTEND_URL` (CORS + password reset links).

## Env

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:7777/api/v1
```

## Structure

```
src/
  app/                    routes (App Router)
    page.js               landing
    (auth)/               login, signup, forgot-password, reset-password/[token]
    feed/                 swipe deck (GET /user/feed, POST /request/send)
    requests/             received requests (GET /user/requests/received, POST /request/review)
    connections/          matches (GET /user/connections)
    profile/              edit profile + live preview (GET /profile/view, PATCH /profile/edit)
  lib/api.js              every backend call in one place
  context/                AuthContext (logged-in user), ToastContext (notifications)
  components/             UI building blocks
```
