import { GoogleGenAI, Chat } from "@google/genai";
import { ServiceType, UserInput } from "../types";
import { createStructurePrompt, createElementPrompt, createCoachPrompt } from "./prompts";

// Helper to clean response text
const cleanText = (text: string | undefined) => text || "분석 결과를 생성하지 못했습니다.";

// Helper to create Gemini client
const createClient = (apiKey: string) => new GoogleGenAI({ apiKey });

// 1. Structure Analysis
export const analyzeStructure = async (
  apiKey: string,
  serviceType: ServiceType,
  inputData: UserInput
): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 입력되지 않았습니다.");

  const ai = createClient(apiKey);
  const prompt = createStructurePrompt(serviceType, inputData);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return cleanText(response.text);
  } catch (error) {
    if (error instanceof Error && error.message.includes('API_KEY')) {
      throw new Error("API Key가 유효하지 않습니다. 올바른 키를 입력해주세요.");
    }
    throw new Error("사주 구조 분석 중 오류가 발생했습니다.");
  }
};

// 2. Element Analysis
export const analyzeElements = async (
  apiKey: string,
  serviceType: ServiceType,
  inputData: UserInput,
  structureAnalysis: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 입력되지 않았습니다.");

  const ai = createClient(apiKey);
  const prompt = createElementPrompt(serviceType, inputData, structureAnalysis);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return cleanText(response.text);
  } catch (error) {
    if (error instanceof Error && error.message.includes('API_KEY')) {
      throw new Error("API Key가 유효하지 않습니다. 올바른 키를 입력해주세요.");
    }
    throw new Error("음양오행 분석 중 오류가 발생했습니다.");
  }
};

// 3. Final Coaching
export const finalizeFortune = async (
  apiKey: string,
  serviceType: ServiceType,
  inputData: UserInput,
  combinedPreviousAnalysis: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key가 입력되지 않았습니다.");

  const ai = createClient(apiKey);
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
    // Fallback logic
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      return cleanText(fallbackResponse.text);
    } catch (fallbackError) {
      if (fallbackError instanceof Error && fallbackError.message.includes('API_KEY')) {
        throw new Error("API Key가 유효하지 않습니다. 올바른 키를 입력해주세요.");
      }
      throw new Error("최종 운세 종합 중 오류가 발생했습니다.");
    }
  }
};

// ==========================================
// Chat Capabilities
// ==========================================

export const createChatSession = (apiKey: string, initialContext: string): Chat => {
  if (!apiKey) throw new Error("API Key가 입력되지 않았습니다.");

  const ai = createClient(apiKey);

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
    5. 사용자의 고민을 공감해주고, 실질적인 해결책을 사주풀이와 연결하여 제시하세요.
  `;

  // Use Gemini 3 Pro for high quality chat interactions with a small thinking budget for reasoning
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: systemInstruction,
      thinkingConfig: { thinkingBudget: 512 }
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