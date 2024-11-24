import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from "dotenv";

dotenv.config();

// GoogleGenerativeAI required config
const configuration = new GoogleGenerativeAI(process.env.API_KEY as string);

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