import { GoogleGenAI, Chat } from "@google/genai";
import { ServiceType, UserInput } from "../types";
import { createStructurePrompt, createElementPrompt, createCoachPrompt } from "./prompts";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to clean response text
const cleanText = (text: string | undefined) => text || "분석 결과를 생성하지 못했습니다.";

// 1. Structure Analysis
export const analyzeStructure = async (
  serviceType: ServiceType,
  inputData: UserInput
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = createStructurePrompt(serviceType, inputData);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return cleanText(response.text);
  } catch (error) {
    console.error("Structure Expert Error:", error);
    throw new Error("사주 구조 분석 중 오류가 발생했습니다.");
  }
};

// 2. Element Analysis
export const analyzeElements = async (
  serviceType: ServiceType,
  inputData: UserInput,
  structureAnalysis: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = createElementPrompt(serviceType, inputData, structureAnalysis);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return cleanText(response.text);
  } catch (error) {
    console.error("Element Expert Error:", error);
    throw new Error("음양오행 분석 중 오류가 발생했습니다.");
  }
};

// 3. Final Coaching
export const finalizeFortune = async (
  serviceType: ServiceType,
  inputData: UserInput,
  combinedPreviousAnalysis: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = createCoachPrompt(serviceType, inputData, combinedPreviousAnalysis);

  try {
    // Requested to use Gemini Pro 3
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 } 
      }
    });
    return cleanText(response.text);
  } catch (error) {
    console.error("Fortune Coach Error:", error);
    // Fallback logic
    try {
        const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return cleanText(fallbackResponse.text);
    } catch (fallbackError) {
        throw new Error("최종 운세 종합 중 오류가 발생했습니다.");
    }
  }
};

// ==========================================
// Chat Capabilities
// ==========================================

export const createChatSession = (initialContext: string): Chat => {
  if (!apiKey) throw new Error("API Key is missing.");

  const systemInstruction = `
    당신은 '박운명'이라는 따뜻하고 통찰력 있는 사주 상담 코치입니다.
    
    다음은 사용자의 사주 분석 결과입니다. 이 내용을 바탕으로 사용자의 질문에 답변해주세요.
    
    === 사주 분석 결과 ===
    ${initialContext}
    === 분석 끝 ===
    
    규칙:
    1. 분석 결과에 있는 내용을 근거로 답변하세요.
    2. 결과에 없는 내용은 "사주 원국에는 구체적으로 나와있지 않지만..."과 같이 전제하고 일반적인 명리학 지식으로 답변하세요.
    3. 항상 희망적이고 긍정적인 방향으로 조언하세요.
    4. 말투는 정중하고 부드러운 경어체를 사용하세요.
  `;

  // Use Gemini 3 Pro for high quality chat interactions
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const sendChatMessage = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return cleanText(response.text);
  } catch (error) {
    console.error("Chat Error:", error);
    throw new Error("답변을 생성하는 중 오류가 발생했습니다.");
  }
};