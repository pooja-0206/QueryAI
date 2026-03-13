import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getAI = () => {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
};

export const generateSQL = async (query: string, schema: string, tableName: string) => {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";

  const prompt = `
    You are an expert SQL generator. 
    Given the following database schema for a table named "${tableName}":
    Schema: ${schema}

    Convert the following natural language query into a valid SQLite SELECT statement.
    Query: "${query}"

    Rules:
    1. Only return the SQL query, nothing else.
    2. Use the table name "${tableName}".
    3. Ensure the SQL is compatible with SQLite.
    4. Do not include any explanations or markdown formatting.
  `;

  const result = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return result.text.replace(/```sql|```/g, "").trim();
};

export const generateInsights = async (query: string, results: any) => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const prompt = `
    You are a business intelligence analyst.
    The user asked: "${query}"
    The query returned the following results:
    ${JSON.stringify(results, null, 2)}

    Provide a brief, clear, and professional insight explaining these results to a non-technical business user.
    Focus on trends, anomalies, or key takeaways.
    Keep it under 3 sentences.
  `;

  const result = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return result.text.trim();
};

export const generateStrategy = async (insights: string) => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const prompt = `
    Based on the following business data insights:
    "${insights}"

    Suggest one actionable business strategy or recommendation.
    Keep it concise and professional.
  `;

  const result = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return result.text.trim();
};
