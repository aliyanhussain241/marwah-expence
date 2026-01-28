import { GoogleGenAI } from "@google/genai";
import { Transaction, ComputedMetrics } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateBusinessInsights = async (
  transactions: Transaction[],
  metrics: ComputedMetrics
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure the environment variable API_KEY to use AI insights.";
  }

  // Summarize data to avoid token limits
  const recentTransactions = transactions.slice(0, 50); // Analyze last 50 transactions for brevity
  const dataSummary = JSON.stringify({
    metrics,
    recentSampleData: recentTransactions
  });

  const prompt = `
    Act as a senior business analyst. Analyze the following financial data for a business operating in Pakistan.
    
    **Context:**
    - Currency: PKR (Pakistani Rupee)
    - Market: Pakistan
    
    Data Summary:
    ${dataSummary}

    Please provide a concise but impactful analysis covering:
    1. **Profitability Analysis**: Are they making money? What is the trend?
    2. **Cost Drivers**: What is eating up the budget? (Product vs Marketing vs Other).
    3. **ROI Insight**: Is the marketing spend justified based on the Marketing ROI?
    4. **Actionable Recommendations**: 3 bullet points on how to improve net profit in the local market context.

    Format the output with Markdown headers and bullet points. Keep it professional and encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response on simple analysis
      }
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Error generating insights:", error);
    return "Failed to generate insights at this time. Please try again later.";
  }
};