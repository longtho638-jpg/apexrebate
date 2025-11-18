import { NextRequest, NextResponse } from 'next/server';
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
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}

`));
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
