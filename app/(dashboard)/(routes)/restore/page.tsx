'use client';

import Heading from '@/components/heading';
import { routes } from '@/lib/constant';
import { NextPage } from 'next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api, cn } from '@/lib/utils';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useLoadAlert } from '@/components/useLoadAlert';
import Loader from '@/components/loader';
import Empty from '@/components/Empty';
import { useScroll } from '@/components/useScroll';
import { useRestoreImageStore } from '@/store/use-restore-store';
import ImageCard from '@/components/image-card';
import { insertUserApiLmit } from '@/actions/insert-api-count';
import { useCountStore } from '@/store/use-count-store';
import useSubscriptionModalStore from '@/store/subscription-modal-store';
import TextField from '@/components/text-field';
import Avator from '@/components/avator';
import { Collapsible } from '@radix-ui/react-collapsible';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronsUpDown } from 'lucide-react';

const headingData = routes[5];

const RestoreImagePage: NextPage = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File>();
  const [formData, setFormData] = useState({ imageUrl: '', message: '' });

  const messagesEndRef = useRef(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { history, setHistory, createChat, clearHistory } = useRestoreImageStore();
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
      setIsLoading(true);

      //updated prompt
      history[idx].parts.message = value;
      history[idx + 1].parts = 'Genius is thinking...';
      let reference = history;
      clearHistory();
      setHistory(reference);

      const modelResponse = await generateResponse(history[idx].parts);
      history[idx + 1].parts = modelResponse;
      reference = history;
      clearHistory();
      setHistory(history);

      await increaseApiCount();
    } catch (error) {
      toast.error('something went wrong.');
    }

    setIsLoading(false);
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (checkUserApiLimit()) return;

    if (!formData.imageUrl || !formData.message) {
      toast.error('prompt required');
      return;
    }
    const userChat = createChat('user', { url: formData.imageUrl, message: formData.message });
    setHistory([userChat]);
    setIsLoading(true);
    try {
      const url = await generateResponse({
        image: file,
        message: formData.message,
      });

      const modelChat = createChat('model', url);
      setHistory([modelChat]);
      await increaseApiCount();
    } catch (error) {
      toast.error('something went wrong');
    }
    setIsLoading(false);
    resetForm();
  }

  const resetForm = () => {
    setFormData({ imageUrl: '', message: '' });
    if (fileRef.current) fileRef.current.value = '';
    setFile(undefined);
  };

  const generateResponse = async (data: any) => {
    const res = api.post('/api/restore', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
    });
    const result = (await res).data;
    return URL.createObjectURL(result);
  };

  useLoadAlert();
  useScroll(messagesEndRef, [history, setHistory, isLoading]);

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
                      {chat.parts.includes('Genius is thinking...') ? (
                        <p>{chat.parts}</p>
                      ) : (
                        <ImageCard url={chat.parts} isDownloadabe={true} />
                      )}
                    </>
                  )}
                  {!isModel && (
                    <>
                      <Avator
                        imagurl={user?.imageUrl}
                        name={user?.firstName?.charAt(0).toUpperCase()}
                      />
                      <div className="flex h-auto w-full flex-col gap-y-2">
                        <ImageCard url={chat.parts.url} />
                        <TextField
                          text={chat.parts.message}
                          onSubmit={(value: string) => onUpdate(value, idx)}
                        />
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
            <CollapsibleContent className="col-span-12 grid grid-cols-12 gap-x-4 md:col-span-9">
              <div className="col-span-12 md:col-span-9">
                <Input
                  name="message"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  disabled={isLoading}
                  required
                  type="text"
                  placeholder="Deblur this image"
                  className="border-none text-[16px] outline-none ring-0 ring-transparent focus-visible:ring-0 focus-visible:ring-transparent"
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <Input
                  name="imageUrl"
                  disabled={isLoading}
                  ref={fileRef}
                  required
                  type="file"
                  accept="image/*"
                  className="cursor-pointer outline-none ring-0 ring-transparent focus-visible:ring-0 focus-visible:ring-transparent"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setFormData({ ...formData, imageUrl: url });
                      setFile(file);
                    }
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

export default RestoreImagePage;
