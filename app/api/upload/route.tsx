import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { FileState, GoogleAIFileManager } from '@google/generative-ai/server';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

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

    const tempDir = path.join(os.tmpdir(), 'uploads'); // Using OS temp directory
    await mkdir(tempDir, { recursive: true });

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    const filePath = path.join(tempDir, file.name);

    await writeFile(filePath, buffer);

    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: file.type,
      displayName: file.name,
    });

    if (!uploadResult) {
      return new NextResponse('Internal Error', { status: 500 });
    }

    let remoteFile = await fileManager.getFile(uploadResult.file.name);

    while (remoteFile.state === FileState.PROCESSING) {
      await new Promise(resolve => setTimeout(resolve, 10_000));
      remoteFile = await fileManager.getFile(uploadResult.file.name);
    }

    if (remoteFile.state === FileState.FAILED) {
      return new NextResponse('Audio processing failed', { status: 500 });
    }

    return NextResponse.json({ file: uploadResult.file }, { status: 200 });
  } catch (error) {
    console.log(`[UPLOAD_ERROR]: ${error}`);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
