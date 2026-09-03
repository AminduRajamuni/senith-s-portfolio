# Admin dashboard setup

The `/admin` section lets you manage the "Motion Graphics" folders/videos
shown elsewhere on the site. It stores everything in **Cloudinary** — video
files as uploads, folder structure as real Cloudinary folders, and each
video's title/description as metadata on the asset itself. No separate
database.

## 1. Create a free Cloudinary account

1. Sign up at [cloudinary.com](https://cloudinary.com/users/register/free) (free tier: ~25GB storage, ~25GB bandwidth/month, no credit card).
2. On your [Console dashboard](https://console.cloudinary.com/), copy:
   - **Cloud name**
   - **API Key**
   - **API Secret** (click "reveal")

## 2. Add the env vars

Create `.env.local` in the project root (already git-ignored, so your keys
never get committed):

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Restart `npm run dev` after adding/changing these.

Until they're set, `/admin/dashboard` still loads (so you can check the
login screen), but shows a "Cloudinary isn't configured yet" notice instead
of folders.

## 3. Log in

Go to `/admin` and enter the password: **`KusalPonzi123`**

This password (and the cookie-signing secret next to it) is hardcoded in
[`lib/admin-auth.ts`](lib/admin-auth.ts) rather than read from an env var,
per how this was set up. If you ever make this repository public, change
both values first — anyone who can read the source can read the password.

## What the dashboard does

- **Folders** (`/admin/dashboard`) — create/delete folders. These map
  directly to Cloudinary folders under `portfolio/motion-graphics/`.
  Deleting a folder deletes every video inside it too.
- **Videos** (inside a folder) — add a video with a title and description,
  or delete one. Uploads go straight from your browser to Cloudinary (the
  file never passes through this app's server), so there's no upload size
  limit imposed by Next.js itself — only whatever your Cloudinary plan
  allows per file (100MB on the free plan).

## Security notes

- Every mutating action (`app/admin/actions.ts`) re-checks the session
  cookie itself, in addition to the route-level check in `proxy.ts` — so
  protection doesn't silently disappear if routes get refactored later.
- The session cookie is `httpOnly` + `secure` + signed (HMAC), so it can't
  be read or forged from client-side JS or by guessing.
- This is intentionally a single hardcoded password with no rate limiting —
  fine for a low-stakes personal portfolio, not something to reuse for
  anything sensitive.
