import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeBuildError = async (logs: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please check your environment configuration.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a Senior DevOps Engineer and CI/CD expert.
      Analyze the following CI build error log and provide a concise, actionable solution.
      Format the output in Markdown.

      Structure your response as:
      1. **Root Cause**: What exactly went wrong (1 sentence).
      2. **Solution**: Steps to fix it.
      3. **Code Hint**: If applicable, a small snippet of what to change.

      Error Logs:
      \`\`\`
      ${logs}
      \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Unable to generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to analyze logs. The AI service might be unavailable.";
  }
};