'use client';

import Heading from '@/components/heading';
import { routes } from '@/lib/constant';
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
  const { history, setHistory, createChat } = useDescriptorStore();
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

  const onUpdate = async (value: string, idx: number) => {
    try {
      if (checkUserApiLimit()) return;

      const tempHistory = history[idx];
      tempHistory.content[1].text = value;

      // updating prompt
      let newHistory = history;
      newHistory[idx].content[1].text = value;
      newHistory[idx + 1].content = 'Genius is thinking...';
      setHistory(newHistory);

      const modelResponse = await generateStreamResponse([tempHistory]);
      setUpdateNo(idx + 1);
      const fullResponseText = await processStreamResponse(modelResponse);
      newHistory[idx + 1].content = fullResponseText;
      setHistory(newHistory);
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
    let fullResponseText = '';
    const typingSpeed = 5;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        fullResponseText += chunk;

        for (let i = 0; i < chunk.length; i++) {
          appendCharacter(chunk[i], typingSpeed);
          await new Promise(resolve => setTimeout(resolve, typingSpeed));
        }
      }
    }
    return fullResponseText;
  };

  const appendCharacter = (char: string, speed: number) => {
    setText(prev => (prev ? prev + char : char));
  };

  useLoadAlert();
  useScroll(messagesEndRef, [history, setHistory]);

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
                    'my-4 flex items-start gap-x-8 rounded-md p-4',
                    isModel ? 'bg-accent' : 'border bg-white'
                  )}
                >
                  {isModel && (
                    <>
                      <Image src={'/logo.png'} alt="model" height={30} width={30} />
                      <Markdown text={updateNo === idx ? (text ?? '') : chat.content} />
                    </>
                  )}

                  {!isModel && (
                    <>
                      <Avator
                        imagurl={user?.imageUrl}
                        name={user?.firstName?.charAt(0).toUpperCase()}
                      />
                      <div className="flex w-full flex-col space-y-2">
                        <ImageCard url={chat.content[0].image_url?.url ?? ''} />
                        <TextField
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
              <div className={'my-4 flex items-start gap-x-8 rounded-md bg-accent p-4'}>
                <Image src={'/logo.png'} alt="model" height={30} width={30} />
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
            <CollapsibleContent className="col-span-12 grid grid-cols-12 gap-x-4 md:col-span-9 lg:col-span-10">
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
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setFile(file);
                  }}
                />
              </div>
            </CollapsibleContent>

            <Button
              className="col-span-12 md:col-span-3 lg:col-span-2"
              type="submit"
              disabled={isLoading}
            >
              Generate
            </Button>
          </Collapsible>
        </form>
      </div>

      <Button
        onClick={() => setIsCollapse(!isCollapse)}
        asChild
        className="absolute bottom-14 left-5 cursor-pointer md:hidden"
        variant="ghost"
        size="sm"
      >
        <ChevronsUpDown className="size-6 text-gray-500" />
      </Button>
    </section>
  );
};

export default DescriptorPage;
