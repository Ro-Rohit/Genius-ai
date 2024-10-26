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
import { useDocumentStore } from '@/store/use-document-store';
import Avator from '@/components/avator';
import { insertUserApiLmit } from '@/actions/insert-api-count';
import { useCountStore } from '@/store/use-count-store';
import useSubscriptionModalStore from '@/store/subscription-modal-store';
import Markdown from '@/components/markdown';
import TextField from '@/components/text-field';
import DocumentUploader from '@/components/document-component';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronsUpDown } from 'lucide-react';

const headingData = routes[3];

const DocumentPage: NextPage = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { history, setHistory, createChat } = useDocumentStore();
  const [message, setMessage] = useState<string>('');
  const [updateNo, setUpdateNo] = useState<number | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [file, setFile] = useState<File>();
  const fileRef = useRef<HTMLInputElement>(null);
  const { count, setCount, isPro } = useCountStore();
  const { setIsOpen } = useSubscriptionModalStore();
  const [isCollapse, setIsCollapse] = useState(true);

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

  const onUpdate = async (value: string, idx: number) => {
    try {
      if (checkUserApiLimit()) return;

      const tempHistory = history[idx];
      tempHistory.parts.message = value;

      // updating prompt
      let newHistory = history;
      newHistory[idx].parts.message = value;
      newHistory[idx + 1].parts = 'Genius is thinking...';
      setHistory(newHistory);

      const modelResponse = await generateStreamResponse({
        message: tempHistory.parts.message,
        file: tempHistory.parts.file,
      });
      setUpdateNo(idx + 1);
      const fullResponseText = await processStreamResponse(modelResponse);
      newHistory[idx + 1].parts = fullResponseText;
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

    if (!message || !file) {
      toast.error('prompt required');
      return;
    }

    if (checkUserApiLimit()) return;

    const userChat = createChat('user', { message: message, file: file });

    let tempData = [...history, userChat];
    setHistory(tempData);
    try {
      setIsLoading(true);
      const modelResponse = await generateStreamResponse({ message: message, file: file });
      setIsLoading(false);

      setMessage('');
      if (fileRef.current) fileRef.current.value = '';
      setFile(undefined);

      const FullResponseText = await processStreamResponse(modelResponse);
      const modelChat = createChat('model', FullResponseText);
      tempData = [...tempData, modelChat];
      setText(null);
      setHistory(tempData);
      await increaseApiCount();
    } catch (error) {
      toast.error('something went wrong');
    } finally {
    }
  }

  const generateStreamResponse = async (data: { message: string; file: File }) => {
    const formData = new FormData();

    formData.append('file', data.file);
    formData.append('message', data.message);

    const res = await fetch('/api/document', {
      method: 'POST',
      body: formData,
    });

    if (!res.body || !res.ok) throw new Error('no stream');
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
        for (let i = 0; i < chunk.length; i++) {
          fullResponseText += chunk[i];
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
                    'my-4 flex items-center gap-x-8 rounded-md p-4',
                    isModel ? 'bg-accent' : 'border bg-white'
                  )}
                >
                  {isModel && (
                    <>
                      <Image src={'/logo.png'} alt="model" height={30} width={30} />
                      <Markdown text={updateNo === idx ? (text ?? '') : chat.parts} />
                    </>
                  )}

                  {!isModel && (
                    <>
                      <Avator
                        imagurl={user?.imageUrl}
                        name={user?.firstName?.charAt(0).toUpperCase()}
                      />
                      <div className="flex flex-col space-y-2">
                        <DocumentUploader file={chat.parts.file} />
                        <TextField
                          text={chat.parts.message}
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
        <form onSubmit={onSubmit} className="grid w-full max-w-[650px] border p-4">
          <Collapsible
            open={isCollapse}
            onOpenChange={setIsCollapse}
            className="grid w-full grid-cols-12 gap-4"
          >
            <CollapsibleContent className="col-span-12 grid grid-cols-12 gap-x-4 md:col-span-9">
              <div className="col-span-12 md:col-span-9">
                <Input
                  disabled={isLoading}
                  required
                  type="text"
                  value={message}
                  placeholder="Explain this Document"
                  autoFocus
                  className="outline-none ring-0 ring-transparent focus-visible:ring-0 focus-visible:ring-transparent"
                  onChange={e => {
                    setMessage(e.target.value);
                  }}
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <Input
                  disabled={isLoading}
                  ref={fileRef}
                  required
                  type="file"
                  accept="application/pdf, text/*"
                  className="cursor-pointer outline-none ring-0 ring-transparent focus-visible:ring-0 focus-visible:ring-transparent"
                  onChange={e => {
                    const file = e.target.files?.[0];

                    if (file) setFile(file);
                  }}
                />
              </div>
            </CollapsibleContent>
            <Button className="col-span-12 md:col-span-3" type="submit" disabled={isLoading}>
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

export default DocumentPage;