import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from './index';

// Smoke test for the Vercel serverless entry point: confirms the default
// export is a working Express handler wired to the same routes used by
// the local dev server, so a broken import/export here (which would be
// invisible until an actual Vercel deploy) gets caught in CI instead.
describe('Vercel serverless entry (api/index.ts)', () => {
  it('exports an Express app that responds to GET /api/health', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('RKGIT Safe Companion API');
  });

  it('routes POST /api/triage through the shared handler', async () => {
    const res = await request(app).post('/api/triage').send({ text: 'minor scrape on knee' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('severity');
  });
});
