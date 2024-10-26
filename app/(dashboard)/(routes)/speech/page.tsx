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
import { useSpeechStore } from '@/store/use-speech-store';
import Avator from '@/components/avator';
import { useCountStore } from '@/store/use-count-store';
import useSubscriptionModalStore from '@/store/subscription-modal-store';
import { insertUserApiLmit } from '@/actions/insert-api-count';
import Markdown from '../../../../components/markdown';
import { Collapsible } from '@radix-ui/react-collapsible';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronsUpDown } from 'lucide-react';

const headingData = routes[6];

const speechGenerationPage: NextPage = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File>();

  const messagesEndRef = useRef(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { history, setHistory, createChat } = useSpeechStore();
  const { count, setCount, isPro } = useCountStore();
  const { setIsOpen } = useSubscriptionModalStore();
  const [fileTypes, setFileTypes] = useState<Array<string>>([]);
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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (checkUserApiLimit()) return;

    if (!file) {
      toast.error('prompt required');
      return;
    }
    const url = URL.createObjectURL(file);

    const userChat = createChat('user', { url: url });
    setFileTypes([...fileTypes, file.type]);
    setHistory([userChat]);
    try {
      setIsLoading(true);
      const modelResponse = await generateResponse(file);
      setIsLoading(false);
      if (fileRef.current) fileRef.current.value = '';
      setFile(undefined);
      console.log(modelResponse);
      const modelChat = createChat('model', modelResponse);
      setHistory([modelChat]);
      await increaseApiCount();
    } catch (error) {
      toast.error('something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  const generateResponse = async (file: File) => {
    const formData = new FormData();

    formData.append('file', file);
    const res = await fetch('/api/speech', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('internal error');
    return await res.text();
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
                      <Markdown text={chat.parts} />
                    </>
                  )}
                  {!isModel && (
                    <>
                      <Avator
                        imagurl={user?.imageUrl}
                        name={user?.firstName?.charAt(0).toUpperCase()}
                      />
                      <div className="w-full">
                        <MediaComponent url={chat.parts.url} type={fileTypes[idx]} />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
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
            <CollapsibleContent className="col-span-12 md:col-span-9">
              <div className="w-full">
                <Input
                  disabled={isLoading}
                  ref={fileRef}
                  required
                  type="file"
                  accept="audio/*, video/*"
                  className="cursor-pointer outline-none ring-0 ring-transparent focus-visible:ring-0 focus-visible:ring-transparent"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setFile(file);
                  }}
                />
              </div>
            </CollapsibleContent>
            <Button className="col-span-12 md:col-span-2" type="submit" disabled={isLoading}>
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

export default speechGenerationPage;

const MediaComponent = ({ url, type }: { url: string; type: string }) => {
  if (type.includes('audio/')) {
    return <audio src={url} controls />;
  } else if (type.includes('video/')) {
    return <video src={url} controls />;
  } else {
    return <p>Unknown media type.</p>;
  }
};
