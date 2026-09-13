# Frontend

Copy `.env.example` to `.env`, set the deployed backend `/api` URL, then run `npm install` and `npm run dev`.

For production run `npm run build` and deploy the `dist` directory as a static SPA.

## Vercel

Create the Vercel project with `frontend` as its Root Directory. The included `vercel.json` configures the Vite build, `dist` output, PWA headers, and SPA route fallback. Add `VITE_API_URL` in the Vercel project's environment variables before deploying.
