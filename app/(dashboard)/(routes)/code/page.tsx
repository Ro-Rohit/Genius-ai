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
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useLoadAlert } from '@/components/useLoadAlert';
import { contentType, useCodeStore } from '@/store/use-code-store';
import Loader from '@/components/loader';
import Empty from '@/components/Empty';
import { useScroll } from '@/components/useScroll';
import Markdown from '@/components/markdown';
import Avator from '@/components/avator';
import { insertUserApiLmit } from '@/actions/insert-api-count';
import { useCountStore } from '@/store/use-count-store';
import useSubscriptionModalStore from '@/store/subscription-modal-store';
import TextField from '@/components/text-field';
import { ArrowUpDown, ChevronsUpDown } from 'lucide-react';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

const formSchema = z.object({
  message: z.string().min(1),
});
const headingData = routes[1];

const CodeGenerationPage: NextPage = () => {
  const { user } = useUser();
  const messagesEndRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [isCollapse, setIsCollapse] = useState<boolean>(true);
  const { contents, setContent, createContent } = useCodeStore();
  const [updateNo, setUpdateNo] = useState<number | null>(null);
  const { count, setCount, isPro } = useCountStore();
  const { setIsOpen } = useSubscriptionModalStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

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

      //updated prompt
      const tempContents = contents.slice(0, idx);
      const newChat = createContent('user', value);
      tempContents.push(newChat);

      contents[idx].parts[0].text = value;
      contents[idx + 1].parts[0].text = 'Genius is thinking...';
      let reference = contents;
      setContent(reference);

      const modelResponse = await generateStreamResponse(tempContents);
      setUpdateNo(idx + 1);
      const fullResponseText = await processStreamResponse(modelResponse);
      contents[idx + 1].parts[0].text = fullResponseText;

      reference = contents;
      setContent(reference);
      setText(null);
      await increaseApiCount();
    } catch (error) {
      toast.error('something went wrong.');
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (checkUserApiLimit()) return;

    if (!values.message) {
      toast.error('prompt required');
      return;
    }

    const userChat = createContent('user', values.message);
    let data = [...contents, userChat];
    setContent(data);

    try {
      setIsLoading(true);
      const modelResponse = await generateStreamResponse(data);
      setIsLoading(false);

      const fullResponseText = await processStreamResponse(modelResponse);
      const modelChat = createContent('model', fullResponseText);

      data = [...contents, userChat, modelChat];
      setContent(data);
      await increaseApiCount();
    } catch (error) {
      toast.error('something went wrong');
    } finally {
      form.reset();
      setText(null);
      setIsLoading(false);
    }
  }

  const generateStreamResponse = async (data: contentType[]) => {
    const res = await fetch('/api/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: data }),
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
          fullResponseText += chunk[i]; // Accumulate the response character by character
          appendCharacter(chunk[i], typingSpeed); // Simulate typing effect
          await new Promise(resolve => setTimeout(resolve, typingSpeed)); // Delay between each character
        }
      }
    }
    return fullResponseText;
  };

  const appendCharacter = (char: string, speed: number) => {
    setText(prev => (prev ? prev + char : char));
  };

  useLoadAlert();
  useScroll(messagesEndRef, [contents, text, setContent, setText]);

  return (
    <section className="relative h-[calc(100vh-130px)] w-full px-2">
      <Heading
        title={headingData.label}
        description={headingData.description}
        Icon={headingData.icon}
        iconColor={headingData.color}
        iconbg={headingData.iconbg}
      />

      <div className="relative mt-2 flex h-full w-full flex-col items-center justify-between">
        <div className="scrollable-content flex h-full w-full flex-col">
          <Empty
            loading={isLoading}
            isDataEmpty={!contents.length}
            image="/empty.png"
            text="Start a conversation"
          />
          <div ref={messagesEndRef} className="flex-1">
            {contents.map((chat, idx) => {
              const isModel = chat.role === 'model';
              return (
                <div
                  key={idx}
                  className={cn(
                    'my-4 flex items-center gap-x-8 rounded-md p-4',
                    isModel ? 'bg-accent' : 'border bg-white'
                  )}
                >
                  {isModel && <Image src={'/logo.png'} alt="model" height={30} width={30} />}
                  {isModel && (
                    <Markdown text={updateNo === idx ? (text ?? '') : chat.parts?.[0].text} />
                  )}

                  {!isModel && (
                    <Avator
                      imagurl={user?.imageUrl}
                      name={user?.firstName?.charAt(0).toUpperCase()}
                    />
                  )}
                  {!isModel && (
                    <TextField
                      text={chat.parts?.[0].text}
                      onSubmit={(prompt: string) => {
                        onUpdate(prompt, idx);
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* stream response  */}
            {updateNo === null && text && (
              <div className={'my-4 flex items-center gap-x-8 rounded-md bg-accent p-4'}>
                <Image src={'/logo.png'} alt="model" height={30} width={30} />
                <Markdown text={text} />
              </div>
            )}

            <Loader loading={isLoading} />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-[650px] border p-4">
            <Collapsible
              open={isCollapse}
              onOpenChange={setIsCollapse}
              className="grid w-full grid-cols-12 gap-4"
            >
              <CollapsibleContent className="col-span-12 md:col-span-9 lg:col-span-10">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="focus-visible:ring-transparent? line-clamp-2 border-none text-[16px] outline-none ring-0 ring-transparent focus-visible:ring-0"
                          placeholder="write a code to explain recursion"
                          autoFocus
                          {...field}
                          required
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
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
        </Form>

        <Button
          onClick={() => setIsCollapse(!isCollapse)}
          asChild
          className="absolute bottom-20 left-5 cursor-pointer md:hidden"
          variant="ghost"
          size="sm"
        >
          <ChevronsUpDown className="size-6 text-gray-500" />
        </Button>
      </div>
    </section>
  );
};

export default CodeGenerationPage;
