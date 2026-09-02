<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# RKGIT Safe Companion

Accessible multimodal health & safety companion for **Raj Kumar Goel Institute of Technology (RKGIT), Ghaziabad** — built on Gemini. Accepts text, voice, or photo input and returns step-by-step first-aid protocols in English & Hindi, with a live-location SOS alert flow and an on-device incident history.

## ✨ What's new in this revamp

- **🆘 SOS Panic Button** — a persistent floating button available on every screen. Hold for 2 seconds to confirm (prevents accidental triggers), fetch your **live GPS location**, and instantly call, SMS, or WhatsApp your location to RKGIT Security, the Campus Dispensary, and the 108 Ambulance service.
- **🎙️ Voice Input** — describe an emergency hands-free using the mic button in the triage form (Web Speech API, English & Hindi), now with a live "listening" waveform indicator.
- **🗂️ Incident History** — every AI triage, offline fallback, and SOS alert is saved locally on your device (no server storage) so you can revisit past guidance or show a responder what happened.
- **🌐 Safety Warning Translator** — paste any safety notice or campus warning and translate it between English and Hindi on demand, powered by the existing Gemini `/api/translate` endpoint.
- **🗺️ Tabbed navigation** — the app is now organized into four clear sections (AI Triage, Offline Guides, Safety Hub, History) via a sticky tab bar instead of one long scrolling page.

## Core features (carried over & preserved)

- Multimodal Gemini triage: describe symptoms by text/voice or attach a photo (camera or upload) of an injury/hazard for visual assessment.
- Bilingual English/Hindi output for every triage result, including text-to-speech "Read Aloud" hands-free narration.
- 100% offline fallback: pre-cached first-aid guides (CPR, bleeding, burns, fractures, electric shock, heat exhaustion, choking, bites/stings) and a rule-based matcher when the network or Gemini API is unavailable.
- RKGIT campus-specific quick-dial: security, health center, medical officer, police, ambulance, women's safety cell, fire, and proctor contacts, filterable by category.
- Installable PWA (Add to Home Screen / native install prompt) for instant access during an emergency.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key (the app runs in an offline-safe fallback mode without one).
3. Run the app:
   `npm run dev`

## Notes on the SOS flow

The SOS button uses the browser's Geolocation API to get a live position and opens native `tel:`, `sms:`, and WhatsApp (`wa.me`) links so it works with zero extra configuration. The alert is also logged to the server via `POST /api/sos` for audit purposes — wire this endpoint into a real SMS/push gateway (e.g. Twilio, Fast2SMS, Firebase Cloud Messaging) to actively push notifications to contacts in a production deployment.
