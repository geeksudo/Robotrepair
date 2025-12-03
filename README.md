# Robomate Service App (Demo v3.0)

## Overview
A specialized repair management dashboard for Robomate technicians. The app streamlines the RMA process, inventory usage, and leverages **Google Gemini AI** to write professional customer emails.

## Core Features

### 1. AI Quotation System
*   **Workflow:** Technician diagnoses unit -> Selects Parts -> Sets Labor Cost.
*   **Output:** Generates a formal, itemized **Quotation Email** requesting customer approval.
*   **Logic:** Distinguishes between 'Replaced' (Chargeable) and 'Repaired' ($0 cost) items.

### 2. AI Service Reporting
*   **Workflow:** Technician marks repair as complete.
*   **Output:** Generates a polished **Service Report Email**.
*   **Standardization:** Automatically includes mandatory Robomate specific text:
    *   *Test Results:* "Mower fully tested, mapping restored..."
    *   *Recommendations:* "Clean bottom, replace blades..."
    *   *Logistics:* "Shipping info notified separately."

## Technical Stack
*   **Frontend:** React 19 (ESM), Tailwind CSS (CDN).
*   **AI Engine:** Google Gemini API (`@google/genai`).
*   **Data:** Browser LocalStorage (Demo) / Excel Export & Import (Sync).

## Integration Guide for IT
To integrate this into the company infrastructure:
1.  **Database:** Replace the `localStorage` logic in `App.tsx` with a persistent backend (e.g., Firebase Firestore or SQL).
2.  **Hosting:** Deploy as a static site (Vercel, Netlify, or internal S3 bucket).
3.  **Security:** Move the Google API Key to a secure backend proxy to prevent exposure.

## Files Included
*   `index.html` - Entry point & styling.
*   `index.tsx` - React mount.
*   `App.tsx` - Main logic & State.
*   `types.ts` - Data models.
*   `constants.ts` - Spare parts database.
*   `services/geminiService.ts` - AI Prompt engineering.
*   `components/` - UI Components.
