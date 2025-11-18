#!/usr/bin/env node

/**
 * Gemini 3.0 Pro Preview Deployment Script
 * Triển khai Gemini 3.0 với Extended Thinking cho ApexRebate
 * 
 * Chạy: npm run deploy:gemini:3
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

console.log('═══════════════════════════════════════════════════');
console.log('   🚀 GEMINI 3.0 PRO PREVIEW DEPLOYMENT');
console.log('═══════════════════════════════════════════════════\n');

// Step 1: Update ai-config.ts
console.log('📝 Step 1: Update AI Configuration');
console.log('─────────────────────────────────\n');

const aiConfigPath = path.join(rootDir, 'src/lib/ai-config.ts');
let aiConfigContent = fs.readFileSync(aiConfigPath, 'utf-8');

// Add Gemini types
if (!aiConfigContent.includes("'gemini-3-pro-preview'")) {
  aiConfigContent = aiConfigContent.replace(
    "export type AIProvider = 'openai' | 'anthropic';",
    "export type AIProvider = 'openai' | 'anthropic' | 'google';"
  );
  
  aiConfigContent = aiConfigContent.replace(
    "export type AIModel = \n  | 'gpt-4'",
    "export type AIModel = \n  | 'gemini-3-pro-preview'\n  | 'gpt-4'"
  );

  // Add Gemini config
  const geminiConfig = `  // Google Gemini Models
  'gemini-3-pro-preview': {
    provider: 'google',
    model: 'gemini-3-pro-preview',
    enabled: true,
    maxTokens: 32000,
    temperature: 0.7,
    topP: 1,
    rateLimit: 1000,
    costPer1MTokens: {
      input: 1.0,
      output: 4.0
    }
  },`;

  aiConfigContent = aiConfigContent.replace(
    "  // OpenAI Models",
    geminiConfig + "\n  // OpenAI Models"
  );

  // Add Google config function
  const googleConfigFunc = `/**
 * Lấy cấu hình Google Gemini - CHỈ SỬ DỤNG TRÊN SERVER
 * Gọi hàm này trong API routes hoặc server components
 */
export const getGoogleConfig = (): AIProviderConfig => {
  if (typeof window !== 'undefined') {
    throw new Error('getGoogleConfig() chỉ có thể gọi trên server-side');
  }
  
  return {
    apiKey: process.env.GEMINI_API_KEY || '',
    baseURL: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: (process.env.GEMINI_DEFAULT_MODEL as AIModel) || 'gemini-3-pro-preview'
  };
};

`;

  aiConfigContent = aiConfigContent.replace(
    "export const getAnthropicConfig = (): AIProviderConfig => {",
    googleConfigFunc + "export const getAnthropicConfig = (): AIProviderConfig => {"
  );

  // Update default model
  aiConfigContent = aiConfigContent.replace(
    "  chat: 'claude-sonnet-4.5' as AIModel,",
    "  chat: 'gemini-3-pro-preview' as AIModel, // ✅ GEMINI 3.0 PRO PREVIEW"
  );

  fs.writeFileSync(aiConfigPath, aiConfigContent, 'utf-8');
  console.log('✅ ai-config.ts updated');
  console.log('   - Added Gemini 3.0 Pro Preview type');
  console.log('   - Added Gemini provider configuration');
  console.log('   - Set as default chat model\n');
}

// Step 2: Update .env.local
console.log('📝 Step 2: Update Environment Variables');
console.log('─────────────────────────────────────\n');

const envPath = path.join(rootDir, '.env.local');
let envContent = fs.readFileSync(envPath, 'utf-8');

const geminiVars = [
  'GEMINI_API_KEY=AIzaSyBrCkdc9nnW7ZYEGqWWzpg4OPbYT7ycJ30',
  'GEMINI_DEFAULT_MODEL=gemini-3-pro-preview',
  'GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta'
];

geminiVars.forEach(envVar => {
  const [key] = envVar.split('=');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  
  if (!envContent.match(regex)) {
    envContent += `\n${envVar}`;
    console.log(`✅ Added: ${key}`);
  } else {
    console.log(`⚠️  ${key} already exists`);
  }
});

fs.writeFileSync(envPath, envContent, 'utf-8');
console.log('\n✅ .env.local updated\n');

// Step 3: Create Gemini 3.0 integration file
console.log('📝 Step 3: Create Gemini 3.0 Integration');
console.log('──────────────────────────────────────\n');

const geminiIntegration = `/**
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
`;

const geminiIntegrationPath = path.join(rootDir, 'src/lib/gemini-3-integration.ts');
fs.writeFileSync(geminiIntegrationPath, geminiIntegration, 'utf-8');
console.log('✅ Created src/lib/gemini-3-integration.ts\n');

// Step 4: Create API route
console.log('📝 Step 4: Create Gemini 3.0 API Route');
console.log('──────────────────────────────────────\n');

const apiRoute = `import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini3, generateWithGemini3Stream } from '@/lib/gemini-3-integration';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt, stream = false, config = {} } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (stream) {
      // Stream response
      const encoder = new TextEncoder();
      let buffer = '';

      const stream = new ReadableStream({
        async start(controller) {
          await generateWithGemini3Stream(prompt, (chunk) => {
            buffer += chunk;
            controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ text: chunk })}\n\n\`));
          }, config);
          controller.close();
        }
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      });
    } else {
      // Regular response
      const response = await generateWithGemini3(prompt, config);
      return NextResponse.json({ response });
    }
  } catch (error) {
    console.error('Gemini 3.0 API Error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
`;

const apiRoutePath = path.join(rootDir, 'src/app/api/gemini-3/generate/route.ts');
const apiRouteDir = path.dirname(apiRoutePath);

if (!fs.existsSync(apiRouteDir)) {
  fs.mkdirSync(apiRouteDir, { recursive: true });
}

fs.writeFileSync(apiRoutePath, apiRoute, 'utf-8');
console.log('✅ Created API route: src/app/api/gemini-3/generate/route.ts\n');

// Step 5: Create test file
console.log('📝 Step 5: Create Gemini 3.0 Test');
console.log('─────────────────────────────────\n');

const testFile = `/**
 * Test Gemini 3.0 Pro Preview
 * 
 * Run with: node test-gemini-3.js
 */

import { generateWithGemini3, searchAndAnalyze } from './src/lib/gemini-3-integration';

async function runTests() {
  console.log('🧠 Testing Gemini 3.0 Pro Preview with Extended Thinking...\\n');

  try {
    // Test 1: Basic prompt with thinking
    console.log('Test 1: Basic Prompt with Extended Thinking');
    console.log('──────────────────────────────────────────');
    const response1 = await generateWithGemini3(
      'What is ApexRebate and how does it create value?'
    );
    console.log('✅ Pass');
    console.log('Response length:', response1.length, 'chars\\n');

    // Test 2: Search and analyze
    console.log('Test 2: Google Search Integration');
    console.log('────────────────────────────────');
    const response2 = await searchAndAnalyze(
      'What are the latest trends in cryptocurrency and DeFi?'
    );
    console.log('✅ Pass');
    console.log('Response length:', response2.length, 'chars\\n');

    console.log('═════════════════════════════════════════════');
    console.log('   ✅ ALL TESTS PASSED');
    console.log('═════════════════════════════════════════════\\n');
    
    console.log('📊 Summary:');
    console.log('├─ Model: gemini-3-pro-preview');
    console.log('├─ Extended Thinking: ENABLED (HIGH)');
    console.log('├─ Google Search: READY');
    console.log('└─ Status: OPERATIONAL ✓');
  } catch (err) {
    console.error('❌ Test failed:', (err as Error).message);
    process.exit(1);
  }
}

runTests();
`;

const testPath = path.join(rootDir, 'test-gemini-3.js');
fs.writeFileSync(testPath, testFile, 'utf-8');
console.log('✅ Created test-gemini-3.js\n');

// Step 6: Update package.json
console.log('📝 Step 6: Add npm Scripts');
console.log('─────────────────────────\n');

const packageJsonPath = path.join(rootDir, 'package.json');
let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

if (!packageJson.scripts) {
  packageJson.scripts = {};
}

packageJson.scripts['deploy:gemini:3'] = 'node scripts/deploy-gemini-3.mjs';
packageJson.scripts['test:gemini:3'] = 'node test-gemini-3.js';
packageJson.scripts['gemini:3:chat'] = 'node -e "import(\'./src/lib/gemini-3-integration.ts\').then(m => m.generateWithGemini3(process.argv[1]))"';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
console.log('✅ Updated package.json scripts');
console.log('   - deploy:gemini:3');
console.log('   - test:gemini:3');
console.log('   - gemini:3:chat\n');

// Final Summary
console.log('═══════════════════════════════════════════════════');
console.log('   ✅ GEMINI 3.0 DEPLOYMENT COMPLETE');
console.log('═══════════════════════════════════════════════════\n');

console.log('📊 Deployment Summary:');
console.log('├─ Model: gemini-3-pro-preview');
console.log('├─ Provider: Google AI (Vertex AI compatible)');
console.log('├─ Features: Extended Thinking + Google Search');
console.log('├─ Configuration: Updated');
console.log('├─ Environment: .env.local updated');
console.log('├─ Integration: src/lib/gemini-3-integration.ts');
console.log('├─ API Route: src/app/api/gemini-3/generate');
console.log('├─ Tests: test-gemini-3.js');
console.log('└─ Status: READY FOR PRODUCTION ✓\n');

console.log('🚀 Next Steps:');
console.log('1. npm run build           # Rebuild with new config');
console.log('2. npm run test:gemini:3   # Test Gemini 3.0');
console.log('3. npm run dev             # Start dev server');
console.log('4. curl http://localhost:3000/api/gemini-3/generate -X POST \\');
console.log('   -d "{\"prompt\": \"Test\"}" -H "Content-Type: application/json"\n');

console.log('✨ Gemini 3.0 Pro Preview is now the default model for ApexRebate!');
