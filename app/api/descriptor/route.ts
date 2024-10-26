import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { HfInference } from '@huggingface/inference';

const inference = new HfInference(process.env.INFERENCE_API_KEY);

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const body = await request.json();
    const { content } = body;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const response = inference.chatCompletionStream({
      messages: content,
      model: 'meta-llama/Llama-3.2-11B-Vision-Instruct',
      max_tokens: 500,
      stream: true,
    });

    if (!response) {
      return new NextResponse('Internal Error', { status: 500 });
    }

    const stream = iteratorToStream(response);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.log(`[DESCRIPTOR_ERROR]: ${error}`);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of iterator) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(new TextEncoder().encode(content));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
