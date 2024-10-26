import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { auth } from '@clerk/nextjs/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY ?? '');

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    const form = await request.formData();
    const message = form.get('message') as string;
    const file = form.get('file') as File;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!message || !file) {
      return new NextResponse('Missing required fields', { status: 400 });
    }
    if (!genAI.apiKey || !fileManager.apiKey) {
      return new NextResponse('Gemini ai not configured', { status: 500 });
    }

    const tempDir = path.join(os.tmpdir(), 'uploads'); // Using OS temp directory
    await mkdir(tempDir, { recursive: true });

    // Convert the file into a buffer and save it
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    const filePath = path.join(tempDir, file.name);

    // Write the file to the temporary directory
    await writeFile(filePath, buffer);

    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: file.type,
      displayName: file.name,
    });

    if (!uploadResponse) {
      return new NextResponse('Internal Error', { status: 500 });
    }

    console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const result = await model.generateContentStream([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: message },
    ]);

    const stream = iteratorToStream(result.stream);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.log(`[DOCUMENT_ERROR]: ${error}`);
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
