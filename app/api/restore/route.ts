import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { HfInference } from '@huggingface/inference';

const inference = new HfInference(process.env.INFERENCE_API_KEY);

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const form = await request.formData();
    const message = form.get('message') as string;
    const image = form.get('image') as Blob | ArrayBuffer;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!image || !message) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const response = await inference.imageToImage({
      inputs: image,
      model: 'timbrooks/instruct-pix2pix',
      parameters: {
        prompt: message,
      },
    });

    return new NextResponse(response, {
      status: 200,
      headers: { 'Content-Type': response.type, 'Content-Length': response.size.toString() },
    });
  } catch (error) {
    console.log(`[RESTORE_IMAGE_ERROR]: ${error}`);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
