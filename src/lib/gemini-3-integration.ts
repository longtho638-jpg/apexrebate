/**
 * Gemini 3.0 Pro Preview Integration
 * Extended Thinking + Google Search capabilities
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface GeminiThinkingConfig {
  thinkingLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface GeminiGenerationConfig {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  thinkingConfig?: GeminiThinkingConfig;
  tools?: any[];
}

/**
 * Generate content with Gemini 3.0 Pro Preview
 * Supports Extended Thinking and Google Search
 */
export async function generateWithGemini3(
  prompt: string,
  config: GeminiGenerationConfig = {}
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
  });

  const defaultConfig: GeminiGenerationConfig = {
    maxOutputTokens: 32000,
    temperature: 0.7,
    topP: 1,
    thinkingConfig: {
      thinkingLevel: "HIGH"
    },
    ...config
  };

  const result = await model.generateContent({
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }],
    generationConfig: defaultConfig as any
  });

  return result.response.text();
}

/**
 * Generate content with streaming
 */
export async function generateWithGemini3Stream(
  prompt: string,
  onChunk?: (chunk: string) => void,
  config: GeminiGenerationConfig = {}
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
  });

  const defaultConfig: GeminiGenerationConfig = {
    maxOutputTokens: 32000,
    temperature: 0.7,
    thinkingConfig: {
      thinkingLevel: "HIGH"
    },
    ...config
  };

  const stream = await model.generateContentStream({
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }],
    generationConfig: defaultConfig as any
  });

  let fullText = '';
  for await (const chunk of stream.stream) {
    if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = chunk.candidates[0].content.parts[0].text;
      fullText += text;
      onChunk?.(text);
    }
  }

  return fullText;
}

/**
 * Search and analyze with Google Search integration
 */
export async function searchAndAnalyze(
  query: string,
  config: GeminiGenerationConfig = {}
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
  });

  const searchConfig: GeminiGenerationConfig = {
    ...config,
    tools: [{ googleSearch: {} }]
  };

  const result = await model.generateContent({
    contents: [{
      role: "user",
      parts: [{ text: query }]
    }],
    generationConfig: searchConfig as any
  });

  return result.response.text();
}

export default {
  generateWithGemini3,
  generateWithGemini3Stream,
  searchAndAnalyze
};
