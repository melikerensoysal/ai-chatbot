import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
const API_KEY = import.meta.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: "You are a helpful high school teacher. Answer only questions related to high school curriculum (Math, Physics, Biology, History, Literature etc.). Keep answers concise and educational. If asked about irrelevant topics (games, celebrities), politely decline."
});

export const getGeminiResponse = async (message: string, history: Content[]): Promise<string> => {
  try {
    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("ChatService Error:", error);
    throw error; 
  }
};