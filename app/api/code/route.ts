import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@clerk/nextjs/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contents } = body;

    if (!contents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!genAI.apiKey) {
      return NextResponse.json({ error: 'Gemini AI not configured' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      tools: [
        {
          codeExecution: {},
        },
      ],
    });

    const response = await model.generateContentStream({ contents });

    if (!response || !response.stream) {
      return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }

    const stream = iteratorToStream(response.stream);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('[CODE_ERROR]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of iterator) {
          controller.enqueue(new TextEncoder().encode(chunk.text()));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
