'use client';

import Heading from '@/components/heading';
import { routes } from '@/lib/constant';
import { NextPage } from 'next';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { api, cn } from '@/lib/utils';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useLoadAlert } from '@/components/useLoadAlert';
import Loader from '@/components/loader';
import Empty from '@/components/Empty';
import { useScroll } from '@/components/useScroll';
import { useImageStore } from '@/store/use-image-store';
import ImageCard from '@/components/image-card';
import { useCountStore } from '@/store/use-count-store';
import useSubscriptionModalStore from '@/store/subscription-modal-store';
import { insertUserApiLmit } from '@/actions/insert-api-count';
import TextField from '@/components/text-field';
import Avator from '@/components/avator';
import { Collapsible } from '@/components/ui/collapsible';
import { CollapsibleContent } from '@radix-ui/react-collapsible';
import { ChevronsUpDown } from 'lucide-react';

const formSchema = z.object({
  message: z.string().min(1),
});

const headingData = routes[4];

const ImageGenerationPage: NextPage = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { history, setHistory, createChat } = useImageStore();
  const { count, setCount, isPro } = useCountStore();
  const { setIsOpen } = useSubscriptionModalStore();
  const [isCollapse, setIsCollapse] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const onUpdate = async (value: string, idx: number) => {
    try {
      if (checkUserApiLimit()) return;
      const updatedHistory = getUpdatedHistory(idx, value);
      setHistory(updatedHistory);

      const modelResponse = await generateImage(value);
      updatedHistory[idx + 1].parts = modelResponse;
      setHistory(history);

      await increaseApiCount();
    } catch (error) {
      toast.error('something went wrong.');
    }
  };

  const getUpdatedHistory = (idx: number, value: string) => {
    const chat = history?.[idx + 1] ?? undefined;
    const isModelChat = chat?.role === 'model';

    const updatedHistory = [...history];
    updatedHistory[idx].parts = value;
    if (chat && isModelChat) {
      updatedHistory[idx + 1].parts = 'Genius is thinking...';
    } else {
      const newChat = createChat('model', 'Genius is thinking...');
      updatedHistory.splice(idx + 1, 0, newChat);
    }
    return updatedHistory;
  };

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (checkUserApiLimit()) return;

    if (!values.message) {
      toast.error('prompt required');
      return;
    }
    const userChat = createChat('user', values.message);
    const data = [...history, userChat];
    setHistory(data);
    try {
      setIsLoading(true);
      const imageUrl = await generateImage(values.message);
      const modelChat = createChat('model', imageUrl);
      setHistory([...data, modelChat]);
      await increaseApiCount();
      form.reset();
    } catch (error) {
      toast.error('something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  const generateImage = async (message: string) => {
    let result = await generateResponse('/api/image/stability-large', message);
    if (!result) result = await generateResponse('/api/image/stability-medium', message);
    if (!result) result = await generateResponse('/api/image/stability-base', message);
    if (!result) result = await generateResponse('/api/image/black-forest', message);
    if (!result) result = await generateResponse('/api/image/toybox', message);
    if (!result) result = await generateResponse('/api/image/shakkar-llr', message);
    if (!result) result = await generateResponse('/api/image/shakkar-occ', message);
    return URL.createObjectURL(result);
  };

  const generateResponse = async (endpoint: string, message: string) => {
    const res = api.post(endpoint, { message: message }, { responseType: 'blob' });
    const result = (await res).data;
    return result;
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
                    'my-4 flex flex-col items-start gap-x-8 gap-y-2 rounded-md p-4 md:flex-row md:items-center',
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
                      <TextField
                        isStreaming={false}
                        text={chat.parts}
                        onSubmit={(prompt: string) => {
                          onUpdate(prompt, idx);
                        }}
                      />
                    </>
                  )}
                </div>
              );
            })}

            <Loader loading={isLoading} />
          </div>
        </div>

        {/* prompt  */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid w-full max-w-[650px] border p-4"
          >
            <Collapsible
              open={isCollapse}
              onOpenChange={setIsCollapse}
              className="grid w-full grid-cols-12 gap-4"
            >
              <CollapsibleContent className="col-span-12 md:col-span-10">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          required
                          className="focus-visible:ring-transparent? line-clamp-2 border-none text-[16px] outline-none ring-0 ring-transparent focus:bg-sky-500/10 focus-visible:ring-0"
                          placeholder="sun sky forest wind 8k."
                          autoFocus
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
              <Button className="col-span-12 md:col-span-2" type="submit" disabled={isLoading}>
                Generate
              </Button>
            </Collapsible>
          </form>
        </Form>
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

export default ImageGenerationPage;
