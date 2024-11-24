import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from "dotenv";

dotenv.config();

// GoogleGenerativeAI required config
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}

// Log the API key to the console
console.log("Using API Key:", apiKey);

const configuration = new GoogleGenerativeAI(apiKey);
// Model initialization
const modelId = "gemini-1.5-flash";
const model = configuration.getGenerativeModel({ model: modelId });

export const generatePrompt = async (prompt: string): Promise<string> => {
  const chat = model.startChat({
    history: [], // No history, making individual requests
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  return response.text();
};