'use client';

import Heading from '@/components/heading';
import { BATCH_SIZE, MAX_COUNT, SPEED, routes } from '@/lib/constant';
import { NextPage } from 'next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useLoadAlert } from '@/components/useLoadAlert';
import Loader from '@/components/loader';
import Empty from '@/components/Empty';
import { useScroll } from '@/components/useScroll';
import { useSpeechStore } from '@/store/use-speech-store';
import Avator from '@/components/avator';
import { useCountStore } from '@/store/use-count-store';
import useSubscriptionModalStore from '@/store/subscription-modal-store';
import { insertUserApiLmit } from '@/actions/insert-api-count';
import Markdown from '../../../../components/markdown';
import { Collapsible } from '@radix-ui/react-collapsible';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronsUpDown } from 'lucide-react';
import TextField from '@/components/text-field';
import { FileMetadataResponse } from '@google/generative-ai/server';

const headingData = routes[5];

const speechGenerationPage: NextPage = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File>();

  const messagesEndRef = useRef(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { history, setHistory, createChat, isStreaming, setIsStreaming } = useSpeechStore();
  const { count, setCount, isPro } = useCountStore();
  const { setIsOpen } = useSubscriptionModalStore();
  const [isCollapse, setIsCollapse] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [updateNo, setUpdateNo] = useState<number | null>(null);
  const [text, setText] = useState<string | null>(null);

  const checkUserApiLimit = () => {
    if (isPro) return false;
    if (user && count >= MAX_COUNT) {
      setIsOpen(true);
      return true;
    }
    return false;
  };

  const increaseApiCount = async () => {
    if (isPro) return;
    if (user && !isPro && count < MAX_COUNT) {
      await insertUserApiLmit(user.id, count + 1);
      setCount(count + 1);
    }
  };

  const getUpdatedHistory = (idx: number, value: string) => {
    const chat = history?.[idx + 1] ?? undefined;
    const isModelChat = chat?.role === 'model';

    const updatedHistory = [...history];
    if (!chat || !isModelChat || !chat.parts?.fileMetaData) {
      toast.error('Video not exist.');
      return updatedHistory;
    }

    updatedHistory[idx].parts.message = value;
    updatedHistory[idx + 1].parts.message = 'Genius is thinking...';

    return updatedHistory;
  };

  const onUpdate = async (value: string, idx: number) => {
    try {
      if (checkUserApiLimit()) return;
      if (isStreaming) return;

      // updating prompt
      let updatedHistory = getUpdatedHistory(idx, value);
      setHistory(updatedHistory);
      const fileMetaData = updatedHistory[idx + 1].parts.fileMetaData;
      if (!fileMetaData) return;

      const modelResponse = await generateStreamResponse({
        message: value,
        fileMetaData: fileMetaData as FileMetadataResponse,
      });

      setUpdateNo(idx + 1);
      const fullResponseText = await processStreamResponse(modelResponse);
      updatedHistory[idx + 1].parts.message = fullResponseText;
      setHistory(updatedHistory);
      setUpdateNo(null);
      setText(null);
      await increaseApiCount();
    } catch (error) {
      toast.error('something went wrong.');
    }
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!message || !file) {
      toast.error('prompt required');
      return;
    }
    if (checkUserApiLimit()) return;

    const url = URL.createObjectURL(file);
    const userChat = createChat('user', { message: message, url: url });
    setHistory([...history, userChat]);

    try {
      setIsLoading(true);
      const uploadFileMetadata = await uploadFileToGemini(file);
      const modelResponse = await generateStreamResponse({
        message: message,
        fileMetaData: uploadFileMetadata,
      });
      setIsLoading(false);

      setMessage('');
      if (fileRef.current) fileRef.current.value = '';
      setFile(undefined);

      const FullResponseText = await processStreamResponse(modelResponse);
      const modelChat = createChat('model', {
        fileMetaData: uploadFileMetadata,
        message: FullResponseText,
      });

      setText(null);
      setHistory([...history, userChat, modelChat]);

      await increaseApiCount();
    } catch (error) {
      toast.error('something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  const uploadFileToGemini = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.body || !res.ok) throw new Error('no stream');
    const data = await res.json();
    return data.file;
  };

  const generateStreamResponse = async (data: {
    message: string;
    fileMetaData: FileMetadataResponse;
  }) => {
    const res = await fetch('/api/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.body || !res.ok) throw new Error('no stream');
    return res;
  };

  const processStreamResponse = async (response: any) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    setText('');
    setIsStreaming(true);
    let fullResponseText = '';
    let count = 0;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      if (value) {
        const chunk = decoder.decode(value, { stream: true });

        for (let i = 0; i < chunk.length; i++) {
          fullResponseText += chunk[i];

          // If we've reached the batch size, update the state
          if (count >= BATCH_SIZE) setText(fullResponseText);
          count >= BATCH_SIZE ? (count = 0) : count++;

          await new Promise(resolve => setTimeout(resolve, SPEED));
        }
      }
    }
    setIsStreaming(false);
    return fullResponseText;
  };

  useLoadAlert();
  useScroll(messagesEndRef, [isLoading, setIsLoading]);

  return (
    <section className="relative h-[calc(100vh-130px)] w-full px-2">
      <Heading
        title={headingData.label}
        description={headingData.description}
        Icon={headingData.icon}
        iconColor={headingData.color}
        iconbg={headingData.iconbg}
      />

      <div className="flex h-full w-full flex-col items-center justify-between">
        {/* chats  */}
        <div className="scrollable-content scrollable-content flex h-full w-full flex-col overflow-y-auto">
          <Empty
            loading={isLoading}
            isDataEmpty={!history.length}
            image="/empty.png"
            text="Start a conversation"
          />
          <div ref={messagesEndRef} className="flex-1">
            {history.map((chat, idx) => {
              const isModel = chat.role === 'model';
              return (
                <div
                  key={idx}
                  className={cn(
                    'my-4 flex flex-col items-start gap-x-4 gap-y-2 rounded-md p-4 lg:flex-row lg:items-center',
                    isModel ? 'bg-accent' : 'border bg-white'
                  )}
                >
                  {isModel && (
                    <>
                      <Image
                        className="self-start"
                        src={'/logo.png'}
                        alt="model"
                        height={30}
                        width={30}
                      />
                      <Markdown text={updateNo === idx ? (text ?? '') : chat.parts.message} />
                    </>
                  )}
                  {!isModel && (
                    <>
                      <div className="self-start">
                        <Avator
                          imagurl={user?.imageUrl}
                          name={user?.firstName?.charAt(0).toUpperCase()}
                        />
                      </div>
                      <div className="w-full">
                        <audio src={chat.parts.url} controls></audio>
                        <TextField
                          isStreaming={isStreaming}
                          text={chat.parts.message}
                          onSubmit={(value: string) => onUpdate(value, idx)}
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* stream response  */}
            {updateNo === null && text && (
              <div
                className={
                  'my-4 flex flex-col items-start gap-x-8 gap-y-2 rounded-md bg-accent p-4 lg:flex-row lg:items-center'
                }
              >
                <Image
                  className="self-start"
                  src={'/logo.png'}
                  alt="model"
                  height={30}
                  width={30}
                />
                <Markdown text={text} />
              </div>
            )}

            <Loader loading={isLoading} />
          </div>
        </div>

        {/* prompt  */}
        <form onSubmit={onSubmit} className="w-full max-w-[650px] border p-4">
          <Collapsible
            open={isCollapse}
            onOpenChange={setIsCollapse}
            className="grid w-full grid-cols-12 gap-4"
          >
            <CollapsibleContent className="col-span-12 grid grid-cols-12 gap-x-4 gap-y-2 md:col-span-9 lg:col-span-10">
              <div className="col-span-12 md:col-span-8">
                <Input
                  disabled={isLoading}
                  required
                  type="text"
                  value={message}
                  placeholder="Transcript, metadata, summarize this audio."
                  autoFocus
                  className="outline-none ring-0 ring-transparent focus-visible:ring-0 focus-visible:ring-transparent"
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <Input
                  disabled={isLoading}
                  ref={fileRef}
                  required
                  type="file"
                  accept="audio/*"
                  className="cursor-pointer outline-none ring-0 ring-transparent focus-visible:ring-0 focus-visible:ring-transparent"
                  onChange={e => setFile(e.target.files?.[0])}
                />
              </div>
            </CollapsibleContent>
            <Button
              className="col-span-12 md:col-span-3 lg:col-span-2"
              type="submit"
              disabled={isLoading || isStreaming}
            >
              Generate
            </Button>
          </Collapsible>
        </form>
      </div>
      <div
        onClick={() => setIsCollapse(!isCollapse)}
        className={cn(
          'absolute -bottom-1 -left-5 cursor-pointer rounded-full bg-accent p-2.5 transition duration-100 md:hidden',
          isCollapse ? 'scale-75' : 'scale-100'
        )}
      >
        <ChevronsUpDown className="size-6 rotate-45 text-zinc-600" />
      </div>
    </section>
  );
};

export default speechGenerationPage;
