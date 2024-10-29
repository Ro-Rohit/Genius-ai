'use client';

import Heading from '@/components/heading';
import { BATCH_SIZE, SPEED, routes } from '@/lib/constant';
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
import ImageCard from '@/components/image-card';
import Avator from '@/components/avator';
import { useDescriptorStore } from '@/store/use-descriptor-store';
import Markdown from '../../../../components/markdown';
import { useCountStore } from '@/store/use-count-store';
import useSubscriptionModalStore from '@/store/subscription-modal-store';
import { insertUserApiLmit } from '@/actions/insert-api-count';
import { getImage, uploadImage } from '@/actions/upload-image';
import TextField from '@/components/text-field';
import { ChevronsUpDown } from 'lucide-react';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

const headingData = routes[2];

const DescriptorPage: NextPage = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const [text, setText] = useState<string | null>(null);
  const [file, setFile] = useState<File>();
  const [message, setMessage] = useState<string>('');
  const [updateNo, setUpdateNo] = useState<number | null>(null);
  const [isCollapse, setIsCollapse] = useState<boolean>(true);

  const messagesEndRef = useRef(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { history, setHistory, createChat, isStreaming, setIsStreaming } = useDescriptorStore();
  const { count, setCount, isPro } = useCountStore();
  const { setIsOpen } = useSubscriptionModalStore();

  const checkUserApiLimit = () => {
    if (isPro) return false;
    if (user && count >= 5) {
      setIsOpen(true);
      return true;
    }
    return false;
  };

  const increaseApiCount = async () => {
    if (isPro) return;
    if (user && !isPro && count < 5) {
      await insertUserApiLmit(user.id, count + 1);
      setCount(count + 1);
    }
  };

  const updateUserChats = (publicUrl: string, txt: string) => {
    const content = [
      { type: 'image_url', image_url: { url: publicUrl } },
      { type: 'text', text: txt },
    ];
    const userChat = createChat('user', content);
    setHistory([userChat]);
    return userChat;
  };

  const getUpdatedHistory = (idx: number, value: string) => {
    const chat = history?.[idx + 1] ?? undefined;
    const isModelChat = chat?.role === 'model';

    const updatedHistory = [...history];
    updatedHistory[idx].content[1].text = value;

    if (chat && isModelChat) {
      updatedHistory[idx + 1].content = 'Genius is thinking...';
    } else {
      const newChat = createChat('model', 'Genius is thinking...');
      updatedHistory.splice(idx + 1, 0, newChat);
    }
    return updatedHistory;
  };

  const onUpdate = async (value: string, idx: number) => {
    try {
      if (checkUserApiLimit()) return;
      if (isStreaming) return;

      const tempHistory = history[idx];
      tempHistory.content[1].text = value;

      const updatedHistory = getUpdatedHistory(idx, value)
      setHistory(updatedHistory);

      const modelResponse = await generateStreamResponse([tempHistory]);
      setUpdateNo(idx + 1);
      const fullResponseText = await processStreamResponse(modelResponse);
      updatedHistory[idx + 1].content = fullResponseText;
      setHistory(updatedHistory);
      setUpdateNo(null);
      setText(null);
      await increaseApiCount();
    } catch (error) {
      console.log(error, history);
      toast.error('something went wrong.');
    }
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (checkUserApiLimit()) return;

    if (!file || !message) {
      toast.error('prompt required');
      return;
    }

    const path = await uploadImage(file);
    if (!path) {
      toast.error('something went wrong');
      return;
    }

    const publicUrl = await getImage(path);
    if (!publicUrl) {
      toast.error('something went wrong');
      return;
    }
    const userChat = updateUserChats(publicUrl, message);
    let data = [...history, userChat];
    setHistory(data);
    try {
      setIsLoading(true);
      const modelResponse = await generateStreamResponse([userChat]);
      setIsLoading(false);

      const FullResponseText = await processStreamResponse(modelResponse);
      const modelChat = createChat('model', FullResponseText);
      data = [...data, modelChat];
      setHistory(data);
      setText('');
      await increaseApiCount();
    } catch (error) {
      toast.error('something went wrong');
    } finally {
      setMessage('');
      if (fileRef.current) fileRef.current.value = '';
      setFile(undefined);
      setIsLoading(false);
    }
  }

  const generateStreamResponse = async (data: any) => {
    const res = await fetch('/api/descriptor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: data }),
    });

    if (!res.ok || !res.body) throw new Error('no stream');
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
        <div className="scrollable-content flex h-full w-full flex-col overflow-y-auto">
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
                    'my-4 flex flex-col items-start gap-x-8 gap-y-2 rounded-md p-4 lg:flex-row lg:items-center',
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
                      <Markdown text={updateNo === idx ? (text ?? '') : chat.content} />
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
                      <div className="flex w-full flex-col space-y-2">
                        <ImageCard url={chat.content[0].image_url?.url ?? ''} />
                        <TextField
                          isStreaming={isStreaming}
                          text={chat.content[1].text}
                          onSubmit={(prompt: string) => {
                            onUpdate(prompt, idx);
                          }}
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
                  placeholder="Explain this image"
                  autoFocus
                  className="outline-none ring-0 ring-transparent focus-visible:ring-0 focus-visible:ring-transparent"
                  onChange={e => {
                    setMessage(e.target.value);
                  }}
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <Input
                  disabled={isLoading}
                  ref={fileRef}
                  required
                  type="file"
                  accept="image/*"
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

export default DescriptorPage;
