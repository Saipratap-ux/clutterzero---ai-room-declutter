# ClutterZero — AI Room Declutter

ClutterZero is a React + Vite room-organization app. The static frontend is deployed to GitHub Pages; its Express/Gemini API must run on a separate Node host.

## Frontend: GitHub Pages

1. Open **Settings → Pages** in this repository.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Open **Settings → Secrets and variables → Actions → Variables**.
4. Add repository variable `VITE_API_BASE_URL` with the public URL of the deployed API, for example `https://YOUR-API.onrender.com` (no trailing slash).
5. Push to `main`, or run **Actions → Deploy ClutterZero to GitHub Pages → Run workflow**.
6. The site is published at https://saipratap-ux.github.io/clutterzero---ai-room-declutter/.

The workflow builds the Vite app and publishes `dist/`. The project base path is configured in `vite.config.ts`.

## Backend: Render

GitHub Pages cannot run Express or keep a Gemini API key secret. Deploy the included `render.yaml` blueprint to Render:

1. Create a Render account and choose **New → Blueprint**.
2. Select this GitHub repository and deploy the blueprint.
3. In the Render service environment, set `GEMINI_API_KEY` to your Google AI Studio API key.
4. Keep `FRONTEND_ORIGIN` set to `https://saipratap-ux.github.io,http://localhost:5173`.
5. Copy the deployed service URL and add it as the GitHub Actions repository variable `VITE_API_BASE_URL`.
6. Re-run the GitHub Pages workflow so the frontend is built with the API URL.

Check the backend at `https://YOUR-API.onrender.com/api/health`. It should return JSON with `status: "ok"`. The free Render service may sleep when idle, so the first request can take longer.

## Local development

- Node.js 22+
- `npm install`
- Create `.env` with `GEMINI_API_KEY=your_key`
- `npm run dev`

For a local frontend talking to a separately hosted API, set `VITE_API_BASE_URL` in the frontend build environment.

## Important

- Never put `GEMINI_API_KEY` in a `VITE_*` variable or commit it to Git.
- Photo analysis and AI chat require the separately deployed backend. If `VITE_API_BASE_URL` is unset, the UI shows a configuration error instead of pretending an AI analysis succeeded.
- Saved room history is stored in the current browser's local storage; it does not sync between devices.
