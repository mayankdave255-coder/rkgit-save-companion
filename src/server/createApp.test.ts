import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp, GeminiClient, parseImagePayload, buildOfflineFallbackTriage } from './createApp';

/** Builds a fake Gemini client whose generateContent is a vi.fn() you control. */
function makeMockGeminiClient(generateContent: GeminiClient['models']['generateContent']): {
  client: GeminiClient;
  generateContentMock: typeof generateContent;
} {
  const client: GeminiClient = { models: { generateContent } };
  return { client, generateContentMock: generateContent };
}

const VALID_TRIAGE_JSON = {
  severity: 'CRITICAL',
  title: 'Severe Chemical Splash',
  titleHi: 'गंभीर रासायनिक छिड़काव',
  summary: 'Chemical exposure to eyes requiring immediate irrigation.',
  summaryHi: 'आंखों में रासायनिक संपर्क, तुरंत सिंचाई आवश्यक।',
  immediateAction: 'Flush eyes with clean water for 15+ minutes.',
  immediateActionHi: 'आंखों को 15+ मिनट तक साफ पानी से धोएं।',
  steps: [
    {
      stepNumber: 1,
      title: 'Flush Eyes',
      instruction: 'Use running water.',
      titleHi: 'आंखें धोएं',
      instructionHi: 'बहते पानी का प्रयोग करें।',
      isCritical: true,
    },
  ],
  warnings: ['Do not rub eyes.'],
  warningsHi: ['आंखों को न रगड़ें।'],
  campusProtocol: 'Go to RKGIT Dispensary immediately.',
  campusProtocolHi: 'तुरंत आरकेजीआईटी डिस्पेंसरी जाएं।',
  vitalSignsToCheck: ['Consciousness', 'Vision'],
  callAmbulanceRecommended: true,
};

describe('GET /api/health', () => {
  it('reports hasApiKey: false when no key is configured', async () => {
    const app = createApp({ apiKey: '' });
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', service: 'RKGIT Safe Companion API', hasApiKey: false });
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('reports hasApiKey: true when a key/client is configured', async () => {
    const { client } = makeMockGeminiClient(vi.fn());
    const app = createApp({ geminiClientFactory: () => client });
    const res = await request(app).get('/api/health');

    expect(res.body.hasApiKey).toBe(true);
  });
});

describe('POST /api/triage', () => {
  it('rejects requests with neither image nor text', async () => {
    const app = createApp({ apiKey: '' });
    const res = await request(app).post('/api/triage').send({ location: 'Admin Block' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/provide an image or text/i);
  });

  it('rejects requests where text is only whitespace', async () => {
    const app = createApp({ apiKey: '' });
    const res = await request(app).post('/api/triage').send({ text: '   ' });

    expect(res.status).toBe(400);
  });

  it('returns the structured offline fallback when no API key is configured, without calling Gemini', async () => {
    const generateContent = vi.fn();
    const app = createApp({ apiKey: '' });

    const res = await request(app).post('/api/triage').send({ text: 'deep cut on arm' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(buildOfflineFallbackTriage('deep cut on arm'));
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('calls the Gemini model with the correct config and returns its parsed JSON', async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: JSON.stringify(VALID_TRIAGE_JSON) });
    const { client } = makeMockGeminiClient(generateContent);
    const app = createApp({ geminiClientFactory: () => client });

    const res = await request(app)
      .post('/api/triage')
      .send({ text: 'chemical splash in eye', location: 'Chemistry Lab', victimAge: '20', language: 'en' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(VALID_TRIAGE_JSON);

    expect(generateContent).toHaveBeenCalledTimes(1);
    const call = generateContent.mock.calls[0][0];
    expect(call.model).toBe('gemini-3.7-flash');
    expect(call.config.systemInstruction).toMatch(/RKGIT/);
    expect(call.config.responseMimeType).toBe('application/json');
    expect(call.config.responseSchema).toBeDefined();
    expect(call.config.temperature).toBe(0.2);

    // The composed prompt should carry through the incident details.
    const textPart = call.contents.parts.find((p: { text?: string }) => p.text);
    expect(textPart.text).toMatch(/chemical splash in eye/);
    expect(textPart.text).toMatch(/Chemistry Lab/);
    expect(textPart.text).toMatch(/20/);
  });

  it('attaches a base64 data-URL image as an inlineData part with the correct mime type', async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: JSON.stringify(VALID_TRIAGE_JSON) });
    const { client } = makeMockGeminiClient(generateContent);
    const app = createApp({ geminiClientFactory: () => client });

    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
    await request(app).post('/api/triage').send({ image: dataUrl, text: 'burn on hand' });

    const call = generateContent.mock.calls[0][0];
    const imagePart = call.contents.parts.find((p: { inlineData?: unknown }) => p.inlineData);
    expect(imagePart.inlineData).toEqual(parseImagePayload(dataUrl));
    expect(imagePart.inlineData.mimeType).toBe('image/png');
    expect(imagePart.inlineData.data).toBe('iVBORw0KGgoAAAANSUhEUgAAAAUA');
  });

  it('treats a raw (non data-URL) base64 image string as image/jpeg', async () => {
    expect(parseImagePayload('rawBase64Bytes==')).toEqual({
      mimeType: 'image/jpeg',
      data: 'rawBase64Bytes==',
    });
  });

  it('returns 500 with fallbackAvailable when Gemini throws', async () => {
    const generateContent = vi.fn().mockRejectedValue(new Error('Gemini quota exceeded'));
    const { client } = makeMockGeminiClient(generateContent);
    const app = createApp({ geminiClientFactory: () => client });

    const res = await request(app).post('/api/triage').send({ text: 'sprained ankle' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Gemini quota exceeded');
    expect(res.body.fallbackAvailable).toBe(true);
  });

  it('returns 500 when Gemini responds with empty text', async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: '' });
    const { client } = makeMockGeminiClient(generateContent);
    const app = createApp({ geminiClientFactory: () => client });

    const res = await request(app).post('/api/triage').send({ text: 'insect bite' });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Empty response received from Gemini model/);
  });

  it('returns 500 when Gemini responds with malformed JSON', async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: 'not valid json {' });
    const { client } = makeMockGeminiClient(generateContent);
    const app = createApp({ geminiClientFactory: () => client });

    const res = await request(app).post('/api/triage').send({ text: 'nosebleed' });

    expect(res.status).toBe(500);
    expect(res.body.fallbackAvailable).toBe(true);
  });
});

describe('POST /api/translate', () => {
  it('requires non-empty text', async () => {
    const app = createApp({ apiKey: '' });
    const res = await request(app).post('/api/translate').send({ text: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Text is required/);
  });

  it('echoes text back unchanged when no API key is configured', async () => {
    const app = createApp({ apiKey: '' });
    const res = await request(app).post('/api/translate').send({ text: 'Wear your helmet', targetLang: 'hi' });

    expect(res.status).toBe(200);
    expect(res.body.translatedText).toBe('Wear your helmet');
  });

  it('calls Gemini and returns the trimmed translated text', async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: '  हेलमेट पहनें  ' });
    const { client } = makeMockGeminiClient(generateContent);
    const app = createApp({ geminiClientFactory: () => client });

    const res = await request(app).post('/api/translate').send({ text: 'Wear your helmet', targetLang: 'hi' });

    expect(res.status).toBe(200);
    expect(res.body.translatedText).toBe('हेलमेट पहनें');

    const call = generateContent.mock.calls[0][0];
    expect(call.model).toBe('gemini-3.7-flash');
    expect(call.contents).toMatch(/Hindi/);
    expect(call.contents).toMatch(/Wear your helmet/);
  });

  it('falls back to the original text if Gemini returns an empty translation', async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: undefined });
    const { client } = makeMockGeminiClient(generateContent);
    const app = createApp({ geminiClientFactory: () => client });

    const res = await request(app).post('/api/translate').send({ text: 'Stay indoors' });

    expect(res.body.translatedText).toBe('Stay indoors');
  });

  it('returns 500 when Gemini throws', async () => {
    const generateContent = vi.fn().mockRejectedValue(new Error('network error'));
    const { client } = makeMockGeminiClient(generateContent);
    const app = createApp({ geminiClientFactory: () => client });

    const res = await request(app).post('/api/translate').send({ text: 'Evacuate the lab' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('network error');
  });
});

describe('POST /api/sos', () => {
  it('logs the alert and returns a generated alertId + timestamp', async () => {
    const app = createApp({ apiKey: '' });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const res = await request(app)
      .post('/api/sos')
      .send({ coords: { latitude: 28.6, longitude: 77.4, accuracy: 10 }, locationLabel: 'Admin Block', notifiedContactIds: ['sec-1'] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.alertId).toMatch(/^sos_\d+_[a-z0-9]+$/);
    expect(typeof res.body.timestamp).toBe('number');
    expect(logSpy).toHaveBeenCalledWith('[SOS ALERT]', expect.objectContaining({ locationLabel: 'Admin Block' }));

    logSpy.mockRestore();
  });

  it('handles a missing body gracefully', async () => {
    const app = createApp({ apiKey: '' });
    const res = await request(app).post('/api/sos').send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
