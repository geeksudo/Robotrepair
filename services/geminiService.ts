import { GoogleGenAI, Type } from "@google/genai";
import { RepairRecord, Part } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuote = async (
  record: RepairRecord,
  partsList: Part[],
  laborCost: number
): Promise<string> => {
    try {
        // Calculate items
        // Include both replaced and repaired items in the quote list
        const items = record.partsActions
            .map(p => {
                const part = partsList.find(sp => sp.id === p.partId);
                const isRepair = p.action === 'repaired';
                return {
                    name: `${part?.name || p.partId} ${isRepair ? '(Repair)' : ''}`,
                    price: isRepair ? 0 : (part?.price || 0)
                };
            });
        
        const partsTotal = items.reduce((sum, item) => sum + item.price, 0);
        const totalCost = partsTotal + laborCost;

        const itemListString = items.map(i => `- ${i.name}: $${i.price.toFixed(2)}`).join('\n');

        const prompt = `
        You are a Senior Service Representative at Robomate. Write a formal Repair Quotation email.

        DETAILS:
        - Customer: ${record.customer.name}
        - Product: ${record.productModel} ${record.productArea} (RMA: ${record.rmaNumber})
        - Proposed Replacements & Repairs:
        ${itemListString}
        - Labor Cost: $${laborCost.toFixed(2)}
        - Total Estimated Cost: $${totalCost.toFixed(2)}
        - Notes: ${record.technicianNotes}

        OUTPUT REQUIREMENTS:
        - Format: Plain Text only (No HTML).
        - Use **Bold** for headers (e.g. **Service Quotation**) using Markdown syntax.
        - Structure:
          - Subject: Service Quotation: [RMA#] [Product]
          - Dear [Name],
          - Explain that diagnostics are complete and parts are needed.
          - List the parts and costs clearly.
          - State the Grand Total.
          - Ask for approval to proceed with the repair.
          - Sign off: Robomate Service Team.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text || "Error generating quote.";
    } catch (error) {
        console.error("Error generating quote:", error);
        return "Error generating quote. Please try again.";
    }
};

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
         - **Critical Formatting Rule**: PLAIN TEXT with Markdown for headers. 
           - DO NOT use HTML tags (like <br>, <p>, <b>). 
           - USE **Bold** for Section Headers (e.g. **Test Results**).
           - Use standard blank lines to separate paragraphs.
         
         - **Structure & Mandatory Wording**:
           Subject: [RMA#] Service Report: [Product Model]

           Dear [Customer Name],

           [Opening: Briefly confirm the repair is complete and successful]

           **Service Details**
           [List the specific repairs/replacements mentioned in the summary above]

           **Test Results**
           • The mower was fully tested, including mapping, charging, mowing, and safety checks.
           • Customer map has been restored.

           **Recommendations**
           • Please clean the bottom of the mower regularly.
           • Replace the blades when they become blunt.
           • Clean the tail panel and the charging pins on the charging dock from time to time.

           If there is any logistics information, we will notify you separately.

           Thanks for your patience, and thank you for choosing Robomate!

           Robomate Service Team

      2. SMS (JSON key: "smsBody"):
         - **Strict Limit**: Under 160 characters.
         - **Content**: Concise notification.
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
