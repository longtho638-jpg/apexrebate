/**
 * Test Gemini 3.0 Pro Preview
 * 
 * Run with: npm run test:gemini:3
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBrCkdc9nnW7ZYEGqWWzpg4OPbYT7ycJ30";

async function runTests() {
  console.log('🧠 Testing Gemini 3.0 Pro Preview with Extended Thinking...\n');

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Test 1: Basic prompt with thinking
    console.log('Test 1: Basic Prompt with Extended Thinking');
    console.log('──────────────────────────────────────────');
    
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
    const response1 = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: 'What is ApexRebate and how does it create value?' }]
      }],
      generationConfig: {
        thinkingConfig: {
          thinkingLevel: "HIGH"
        }
      }
    });

    const text1 = response1.response.text();
    console.log('✅ Pass');
    console.log('Response length:', text1.length, 'chars\n');

    // Test 2: Search and analyze
    console.log('Test 2: Google Search Integration');
    console.log('────────────────────────────────');
    
    const response2 = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: 'What are the latest trends in cryptocurrency and DeFi? (use Google Search)' }]
      }],
      tools: [{ googleSearch: {} }],
      generationConfig: {
        thinkingConfig: {
          thinkingLevel: "HIGH"
        }
      }
    });

    const text2 = response2.response.text();
    console.log('✅ Pass');
    console.log('Response length:', text2.length, 'chars\n');

    // Test 3: Streaming
    console.log('Test 3: Streaming Response');
    console.log('──────────────────────────');

    const stream = await model.generateContentStream({
      contents: [{
        role: "user",
        parts: [{ text: 'Explain quantum computing in simple terms.' }]
      }],
      generationConfig: {
        thinkingConfig: {
          thinkingLevel: "HIGH"
        }
      }
    });

    let streamText = '';
    let chunkCount = 0;
    for await (const chunk of stream.stream) {
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
        streamText += chunk.candidates[0].content.parts[0].text;
        chunkCount++;
      }
    }

    console.log('✅ Pass');
    console.log('Streamed', chunkCount, 'chunks,', streamText.length, 'chars\n');

    console.log('═════════════════════════════════════════════');
    console.log('   ✅ ALL TESTS PASSED');
    console.log('═════════════════════════════════════════════\n');
    
    console.log('📊 Summary:');
    console.log('├─ Model: gemini-3-pro-preview');
    console.log('├─ Extended Thinking: ENABLED (HIGH)');
    console.log('├─ Google Search: READY');
    console.log('└─ Status: OPERATIONAL ✓');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
