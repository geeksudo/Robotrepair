import { GoogleGenAI, Type } from "@google/genai";
import { RepairRecord, Part } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRepairReport = async (
  record: RepairRecord,
  partsList: Part[]
): Promise<{ email: string; sms: string }> => {
  try {
    // Group parts by action
    const replacedParts = record.partsActions
        .filter(p => p.action === 'replaced')
        .map(p => partsList.find(sp => sp.id === p.partId)?.name || p.partId);

    const repairedParts = record.partsActions
        .filter(p => p.action === 'repaired')
        .map(p => partsList.find(sp => sp.id === p.partId)?.name || p.partId);

    let actionSummary = "";
    if (replacedParts.length > 0) {
        actionSummary += `Replaced Components: ${replacedParts.join(", ")}. `;
    }
    if (repairedParts.length > 0) {
        actionSummary += `Repaired Components: ${repairedParts.join(", ")}. `;
    }
    if (replacedParts.length === 0 && repairedParts.length === 0) {
        actionSummary = "General maintenance, diagnostics, and calibration performed. No hardware changes.";
    }

    const prompt = `
      You are a Senior Service Representative at Robomate (authorized Mammotion service partner), writing a formal Service Report.
      
      CUSTOMER & DEVICE DETAILS:
      - Customer: ${record.customer.name}
      - Product: ${record.productModel} ${record.productArea}
      - Device Name/ID: ${record.productName || 'N/A'}
      - RMA Number: ${record.rmaNumber}
      
      SERVICE PERFORMED:
      - ${actionSummary}
      - Technician Notes: ${record.technicianNotes}

      OUTPUT REQUIREMENTS:

      1. EMAIL (JSON key: "emailBody"):
         - **Format**: STRICTLY PLAIN TEXT. NO HTML tags (e.g. <br>, <b>). NO Markdown formatting (e.g. **bold**, ## Heading).
         - **Style**: Formal, professional business correspondence.
         - **Structure** (Use double newlines \\n\\n to separate sections):
           - Subject: [RMA#] Service Update: [Product Model]
           -
           - Dear [Customer Name],
           - [Opening: Confirm completion of service]
           - [Service Details: List what was done clearly using plain text lists, e.g. "- Replaced Motor"]
           - Test Results:
             • The mower was fully tested, including mapping, charging, mowing, and safety checks.
             • Customer map has been restored.
           - Recommendations:
             • Please clean the bottom of the mower regularly.
             • Replace the blades when they become blunt.
             • Clean the tail panel and the charging pins on the charging dock from time to time.
           - [Shipping Information / Tracking if applicable]
           - Robomate Service Team

      2. SMS (JSON key: "smsBody"):
         - **Strict Limit**: Under 160 characters.
         - **Content**: concise notification.
         - **Example**: "Robomate Update: Your [Model] (RMA...) is repaired and has passed QC. Please check your email for the service report."

      Return strictly valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emailBody: { type: Type.STRING },
            smsBody: { type: Type.STRING },
          }
        }
      },
      contents: prompt,
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const parsed = JSON.parse(jsonText);
    
    return {
        email: parsed.emailBody || "Error generating email.",
        sms: parsed.smsBody || "Error generating SMS."
    };

  } catch (error) {
    console.error("Error generating report:", error);
    return {
        email: "Error generating AI report. Please check your connection and try again.",
        sms: "Error generating SMS."
    };
  }
};