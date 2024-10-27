import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { HfInference } from '@huggingface/inference';

const inference = new HfInference(process.env.INFERENCE_API_KEY);

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const body = await request.json();
    const { message } = body;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!message) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    let response = await inference.textToImage({
      model: 'stabilityai/stable-diffusion-3.5-large',
      inputs: message,
    });

    if (!response) {
      response = await inference.textToImage({
        model: 'stabilityai/stable-diffusion-3-medium-diffusers',
        inputs: message,
      });
    }

    if (!response) {
      response = await inference.textToImage({
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        inputs: message,
      });
    }

    if (!response) {
      response = await inference.textToImage({
        model: 'black-forest-labs/FLUX.1-dev',
        inputs: message,
      });
    }

    if (!response) {
      response = await inference.textToImage({
        model: 'Shakker-Labs/FLUX.1-dev-LoRA-One-Click-Creative-Template',
        inputs: message,
      });
    }

    if (!response) {
      response = await inference.textToImage({
        model: 'Shakker-Labs/SD3.5-LoRA-Linear-Red-Light',
        inputs: message,
      });
    }

    if (!response) {
      response = await inference.textToImage({
        model: 'renderartist/toyboxflux',
        inputs: `t0yb0x 3d render of a toy design,${message}`,
      });
    }

    return new NextResponse(response, {
      status: 200,
      headers: { 'Content-Type': 'image/jpeg', 'Content-Length': response.size.toString() },
    });
  } catch (error) {
    console.log(`[IMAGE_GENERATION_ERROR]: ${error}`);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
