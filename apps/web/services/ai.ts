import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize with strict undefined check to prevent runtime errors if env is missing during dev
const apiKey = process.env.API_KEY || 'mock-key';
const ai = new GoogleGenAI({ apiKey });

export const generateAgentResponse = async (
  userMessage: string, 
  context: string,
  language: 'ar' | 'en'
): Promise<string> => {
  
  if (apiKey === 'mock-key') {
    // Mock response for demo purposes if no key is present
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = {
          ar: "هذا رد تجريبي من نظام LUDUS الذكي. يبدو أنك مهتم بالفعاليات الاجتماعية. هل ترغب في استعراض أحدث أنشطة التخييم؟",
          en: "This is a demo response from the LUDUS intelligent system. It seems you are interested in social activities. Would you like to see the latest camping events?"
        };
        resolve(responses[language]);
      }, 1500);
    });
  }

  try {
    const systemPrompt = `You are LUDUS, a premium social activity assistant for the Saudi market. 
    Language: ${language === 'ar' ? 'Arabic (Saudi Dialect Preferred)' : 'English'}.
    Context: ${context}
    Tone: Professional, Welcoming, Culturally Aware.
    Goal: Assist user with booking, discovery, or support.
    Keep responses concise (under 300 characters preferred for chat).`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + "\n\nUser Query: " + userMessage }] }
      ]
    });

    return response.text || "I apologize, I couldn't process that request.";
  } catch (error) {
    console.error("AI Service Error:", error);
    return language === 'ar' 
      ? "عذراً، واجهت مشكلة في الاتصال. يرجى المحاولة مرة أخرى." 
      : "Sorry, I encountered a connection issue. Please try again.";
  }
};