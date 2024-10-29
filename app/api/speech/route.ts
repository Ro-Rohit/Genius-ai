import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FileMetadataResponse } from '@google/generative-ai/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const body = await request.json();
    const message = body.message as string;
    const file = body.fileMetaData as FileMetadataResponse;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!file || !message) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const response = await model.generateContentStream([
      message,
      {
        fileData: {
          fileUri: file.uri,
          mimeType: file.mimeType,
        },
      },
    ]);


    const stream = iteratorToStream(response.stream);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.log(`[SPEECH_GENERATION_ERROR]: ${error}`);
    return new NextResponse('Internal Error', { status: 500 });
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
