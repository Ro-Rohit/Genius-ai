import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { HfInference } from '@huggingface/inference';

const inference = new HfInference(process.env.INFERENCE_API_KEY);

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const form = await request.formData();
    const file = form.get('file') as File;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!file) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const response = await inference.automaticSpeechRecognition({
      data: file,
      model: 'openai/whisper-large-v3',
    });

    return new NextResponse(response.text, {
      status: 200,
      headers: { 'Content-Type': 'text/plain', 'Content-Length': response.text.length.toString() },
    });
  } catch (error) {
    console.log(`[SPEECH_GENERATION_ERROR]: ${error}`);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
