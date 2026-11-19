# PodSweep — validation landing page

Single-page React (Vite) landing page for PodSweep. Email capture writes to Firestore `leads`.

## Run locally
```bash
npm install
cp .env.example .env   # fill in your Firebase web config
npm run dev
```

## Leads (Firestore)
Each signup stores `{ email, createdAt (server time), source, tier }`
- `source`: `hero` | `leak-report` | `final-cta` | `nav` | `pricing`
- `tier`: `Pilot Sweep` | `Archive Retainer` | `Migration Cleanup` | `null`

Security rules live in `firestore.rules`. The public can **create** a valid lead only. Nobody can
read, update, or delete leads from the client, so view them in the Firebase console.
Deploy the rules with `npx firebase deploy --only firestore:rules --project <your-project-id>`.

Honeypot field `website` is visually hidden; filled submissions are dropped silently.

## Test against the emulator (no Firebase project needed)
```bash
npm run emulators   # terminal 1 (needs Java)
VITE_FIREBASE_PROJECT_ID=demo-podsweep VITE_FIREBASE_API_KEY=demo VITE_FIRESTORE_EMULATOR=127.0.0.1:8080 npm run dev
```

## Build
`npm run build` → static site in `dist/`. Host on any static host (Firebase Hosting, Cloud Run, Netlify, Vercel).
After deploying, change `og:image` / `twitter:image` in `index.html` to the absolute URL
(`https://<your-domain>/og-image.png`) so link previews render everywhere.
