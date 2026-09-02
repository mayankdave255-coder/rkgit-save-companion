// Vercel serverless entry point.
//
// Vercel doesn't run a persistent Node process (no app.listen()) — every
// file under /api is deployed as its own serverless function, and Vercel
// invokes it directly as a (req, res) handler. An Express app instance's
// call signature already matches that shape, so exporting it as the
// default export is enough; no extra adapter is needed.
//
// All actual route logic (/api/triage, /api/translate, /api/sos,
// /api/health) lives in ../src/server/createApp.ts, shared with the local
// dev server (server.ts) and the test suite (createApp.test.ts).
import { createApp } from '../src/server/createApp';

const app = createApp();

export default app;
