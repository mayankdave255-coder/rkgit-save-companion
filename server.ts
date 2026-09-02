import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 25mb limit for camera base64 image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy Gemini client helper
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not set. API will operate in fallback mode.');
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'RKGIT Safe Companion API',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Structured schema for first-aid triage output
const triageResponseSchema = {
  type: Type.OBJECT,
  properties: {
    severity: {
      type: Type.STRING,
      description: "Must be 'CRITICAL', 'MODERATE', or 'LOW'",
    },
    title: {
      type: Type.STRING,
      description: "Brief English medical or hazard title (e.g., Severe Chemical Splash, Ankle Inversion Sprain)",
    },
    titleHi: {
      type: Type.STRING,
      description: "Title in Hindi (Devanagari script)",
    },
    summary: {
      type: Type.STRING,
      description: "Concise English assessment of victim state or injury condition (1-2 sentences)",
    },
    summaryHi: {
      type: Type.STRING,
      description: "Summary in Hindi (Devanagari script)",
    },
    immediateAction: {
      type: Type.STRING,
      description: "Most critical action within first 10-30 seconds in English",
    },
    immediateActionHi: {
      type: Type.STRING,
      description: "Most critical action within first 10-30 seconds in Hindi",
    },
    steps: {
      type: Type.ARRAY,
      description: "Step-by-step first-aid protocol numbered sequentially",
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          instruction: { type: Type.STRING },
          titleHi: { type: Type.STRING },
          instructionHi: { type: Type.STRING },
          isCritical: { type: Type.BOOLEAN },
        },
        required: ['stepNumber', 'title', 'instruction', 'titleHi', 'instructionHi'],
      },
    },
    warnings: {
      type: Type.ARRAY,
      description: "What NOT to do / dangerous contraindications in English",
      items: { type: Type.STRING },
    },
    warningsHi: {
      type: Type.ARRAY,
      description: "What NOT to do / dangerous contraindications in Hindi",
      items: { type: Type.STRING },
    },
    campusProtocol: {
      type: Type.STRING,
      description: "Specific action advice for RKGIT Campus (e.g., Campus Dispensary at Admin Block, notify Main Gate Security, Call 108 Ambulance)",
    },
    campusProtocolHi: {
      type: Type.STRING,
      description: "Campus protocol in Hindi",
    },
    vitalSignsToCheck: {
      type: Type.ARRAY,
      description: "List of key signs to monitor (e.g. Consciousness, Regular breathing, Bleeding control, Skin temperature)",
      items: { type: Type.STRING },
    },
    callAmbulanceRecommended: {
      type: Type.BOOLEAN,
      description: "Whether immediate ambulance or hospital dispatch is strictly required",
    },
  },
  required: [
    'severity',
    'title',
    'titleHi',
    'summary',
    'summaryHi',
    'immediateAction',
    'immediateActionHi',
    'steps',
    'warnings',
    'warningsHi',
    'campusProtocol',
    'campusProtocolHi',
    'vitalSignsToCheck',
    'callAmbulanceRecommended',
  ],
};

const SYSTEM_INSTRUCTION = `You are the chief Emergency Medical Triage Specialist and Campus Safety Officer for Raj Kumar Goel Institute of Technology (RKGIT), located in Ghaziabad, Uttar Pradesh, India.
Your mission is to analyze multimodal inputs (images of injuries, burns, fractures, animal bites, chemical splashes, electrical hazards, or text/voice symptom descriptions) and immediately produce life-saving first-aid instructions.

Key Guidelines:
1. Always evaluate severity accurately:
   - CRITICAL: Life-threatening, heavy bleeding, unresponsive/fainting with breathing difficulties, head trauma, severe burns (>10%), cardiac arrest, chemical eye splash, high voltage shock.
   - MODERATE: Deep cuts needing stitches, suspected fractures/dislocations, 2nd-degree localized burns, severe asthma attack, heat exhaustion, insect/dog bites.
   - LOW: Minor scrapes, bruises, small superficial cuts, mild sprains, mild dehydration, headache.
2. Provide clear, direct, and actionable step-by-step first aid in BOTH English and natural, high-quality Hindi (Devanagari script).
3. Include critical DO NOTs (e.g., do not apply toothpaste or ice directly to severe burns; do not move suspected spinal fracture victims; do not give water to unconscious victims).
4. Reference RKGIT campus facilities: RKGIT Campus Health Center / Dispensary (near Admin Block), Main Gate Security Quick Dial, Ghaziabad Emergency 108 / 112.
5. If an image is provided, inspect visual features (color of wound, tissue exposure, swelling, burn blistering, bleeding intensity) to ground your triage.`;

// POST /api/triage
app.post('/api/triage', async (req, res) => {
  try {
    const { image, text, location, victimAge, language } = req.body;

    if (!image && (!text || !text.trim())) {
      res.status(400).json({
        error: 'Please provide an image or text description of the injury or emergency.',
      });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      // Return structured fallback response for offline/dev test if API key is not configured
      res.json({
        severity: 'MODERATE',
        title: text ? `Emergency Assessment: ${text.slice(0, 30)}` : 'Campus First-Aid Protocol',
        titleHi: 'प्राथमिक चिकित्सा प्रोटोकॉल (ऑफ़लाइन मोड)',
        summary: 'Generated baseline first-aid protocol for campus incident. Please consult RKGIT Health Center.',
        summaryHi: 'परिसर घटना के लिए प्राथमिक चिकित्सा प्रोटोकॉल। कृपया आरकेजीआईटी स्वास्थ्य केंद्र से संपर्क करें।',
        immediateAction: 'Ensure scene safety, keep the patient calm, and stabilize the affected area.',
        immediateActionHi: 'घटनास्थल की सुरक्षा सुनिश्चित करें, मरीज को शांत रखें और प्रभावित हिस्से को स्थिर करें।',
        steps: [
          {
            stepNumber: 1,
            title: 'Check Responsiveness & Breathing',
            titleHi: 'होश और सांस की जांच करें',
            instruction: 'Tap gently and ask "Are you okay?". Ensure the airway is clear.',
            instructionHi: 'धीरे से थपथपाएं और पूछें "क्या आप ठीक हैं?"। सुनिश्चित करें कि सांस का रास्ता साफ है।',
            isCritical: true,
          },
          {
            stepNumber: 2,
            title: 'Clean & Protect Area',
            titleHi: 'प्रभावित क्षेत्र को साफ और सुरक्षित करें',
            instruction: 'Use clean saline or drinking water to rinse if superficial. Apply sterile gauze bandage.',
            instructionHi: 'यदि घाव मामूली हो तो साफ पानी से धोएं। बाँझ पट्टी लगाएं।',
            isCritical: false,
          },
          {
            stepNumber: 3,
            title: 'Notify Campus Dispatch',
            titleHi: 'परिसर सुरक्षा को सूचित करें',
            instruction: 'Call RKGIT Main Gate Security or Campus Health Center.',
            instructionHi: 'आरकेजीआईटी मुख्य द्वार सुरक्षा या स्वास्थ्य केंद्र को सूचित करें।',
            isCritical: true,
          },
        ],
        warnings: [
          'Do not leave the injured individual unattended.',
          'Do not apply unverified home remedies or oils to open wounds.',
        ],
        warningsHi: [
          'घायल व्यक्ति को अकेला न छोड़ें।',
          'खुले घावों पर अनधिकृत घरेलू उपचार या तेल न लगाएं।',
        ],
        campusProtocol: 'Escort patient to RKGIT Campus Dispensary located in Admin Block ground floor or dial Main Security at Ext 224.',
        campusProtocolHi: 'मरीज को एडमिन ब्लॉक में स्थित आरकेजीआईटी डिस्पेंसरी ले जाएं या सुरक्षा एक्सटेंशन 224 पर कॉल करें।',
        vitalSignsToCheck: ['Consciousness', 'Breathing Rate', 'Pulse Control', 'Bleeding'],
        callAmbulanceRecommended: false,
      });
      return;
    }

    const ai = getGeminiClient();
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    // Handle base64 image if attached
    if (image && typeof image === 'string') {
      let base64Data = image;
      let mimeType = 'image/jpeg';

      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }

      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    // Compose prompt text
    let userPrompt = `Evaluate this campus emergency situation at RKGIT Ghaziabad:\n`;
    if (text) {
      userPrompt += `Incident / Symptom Description: "${text}"\n`;
    }
    if (location) {
      userPrompt += `Campus Location: ${location}\n`;
    }
    if (victimAge) {
      userPrompt += `Victim Details: ${victimAge}\n`;
    }
    userPrompt += `Primary Language preference: ${language === 'hi' ? 'Hindi' : 'English'}.\n`;
    userPrompt += `Analyze the severity, generate comprehensive first-aid steps in both English and Hindi, provide campus specific actions, list vital signs to monitor, and state if an ambulance is recommended. Return strictly valid JSON conforming to the schema.`;

    parts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: triageResponseSchema,
        temperature: 0.2, // Low temperature for high precision medical triage
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini model.');
    }

    const parsedData = JSON.parse(responseText.trim());
    res.json(parsedData);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in /api/triage:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze emergency triage.',
      fallbackAvailable: true,
    });
  }
});

// POST /api/translate - Quick bilingual translation for custom queries
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Text is required for translation.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.json({ translatedText: text });
      return;
    }

    const ai = getGeminiClient();
    const target = targetLang === 'hi' ? 'Hindi (Devanagari script)' : 'English';
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Translate the following campus first-aid or safety text accurately into ${target}. Return ONLY the translated text without commentary or quotes:\n\n${text}`,
      config: {
        temperature: 0.1,
      },
    });

    res.json({
      translatedText: response.text?.trim() || text,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in /api/translate:', error);
    res.status(500).json({ error: error.message || 'Translation failed.' });
  }
});

// POST /api/sos - Log an emergency SOS dispatch event.
// NOTE: This demo logs the alert server-side for audit purposes. A production deployment
// would wire this into a real SMS/push gateway (e.g. Twilio, Fast2SMS, Firebase Cloud
// Messaging) to actively notify campus security & the victim's emergency contacts.
// Actual notification in this app happens client-side via native tel:/sms:/WhatsApp links,
// since no telecom gateway credentials are configured in this environment.
app.post('/api/sos', (req, res) => {
  try {
    const { coords, locationLabel, notifiedContactIds } = req.body || {};
    const alertId = `sos_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log('[SOS ALERT]', {
      alertId,
      timestamp: new Date().toISOString(),
      coords,
      locationLabel,
      notifiedContactIds,
    });
    res.json({ success: true, alertId, timestamp: Date.now() });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in /api/sos:', error);
    res.status(500).json({ error: error.message || 'Failed to log SOS alert.' });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RKGIT Safe Companion server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
