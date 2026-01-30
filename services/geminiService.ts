import { GoogleGenAI } from "@google/genai";
import { ServiceType, UserInput } from "../types";
import { createStructurePrompt, createElementPrompt, createCoachPrompt } from "./prompts";

// Initialize Gemini Client
// IMPORTANT: Access API Key from process.env strictly
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Use Pro for the final high-quality synthesis
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 } // Thinking budget for better reasoning
      }
    });
    return cleanText(response.text);
  } catch (error) {
    console.error("Fortune Coach Error:", error);
    // Fallback to Flash if Pro fails or quota issues
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