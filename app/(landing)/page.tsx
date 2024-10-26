'use client';
import Image from 'next/image';
import Link from 'next/link';
import TypewriterComponent from 'typewriter-effect';
import { Montserrat } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testimonialData } from '@/lib/constant';

const montserrat = Montserrat({
  weight: ['600', '700', '800'],
  subsets: ['latin', 'vietnamese'],
});

export default function Home() {
  const { isSignedIn } = useAuth();
  return (
    <section className="h-full bg-slate-950 p-4">
      <nav className="flex items-center justify-between pb-36">
        <Link href={'/'} className="flex cursor-pointer items-center gap-x-2">
          <Image src={'/logo.png'} height={30} width={30} alt="Genius" />
          <h4 className={cn(montserrat.className, 'text-lg font-semibold text-white')}>Genius</h4>
        </Link>

        <Link href={isSignedIn ? '/dashboard' : '/sign-up'}>
          <Button variant={'default'} className="rounded-full">
            Get started
          </Button>
        </Link>
      </nav>

      <div className="text-center font-extrabold">
        <h1 className={cn(montserrat.className, 'mb-6 text-3xl text-white md:text-5xl')}>
          The Best AI Tool for
        </h1>
        <div className="mb-1 bg-gradient-to-r from-indigo-200 via-purple-400 to-pink-600 bg-clip-text text-3xl text-transparent md:text-4xl">
          <TypewriterComponent
            options={{
              strings: [
                'Chatbot.',
                'Photo Generation.',
                'Music Generation.',
                'Code Generation.',
                'Video Generation.',
              ],
              loop: true,
              autoStart: true,
            }}
          />
        </div>
        <h6 className="text-sm font-light text-zinc-400">Create content using AI 10x faster</h6>

        <Link href={isSignedIn ? '/dashboard' : '/sign-up'}>
          <Button
            variant={'premium'}
            className="mt-8 rounded-full p-4 font-medium md:p-6 md:text-lg"
          >
            Start Generating for free
          </Button>
        </Link>
        <h6 className="mt-4 text-sm font-light text-zinc-400">No credit card required</h6>
      </div>

      <main className="mx-auto mb-20 w-full max-w-[1200px] pt-36">
        <h2
          className={cn(
            montserrat.className,
            'text-3xl, pb-12 text-center font-bold text-white md:text-5xl'
          )}
        >
          Testimonial
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {testimonialData.map((ts, idx) => (
            <Card key={idx} className="border-none bg-[#192339]">
              <CardHeader>
                <CardTitle className="text-lg capitalize text-white">{ts.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {ts.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-white">{ts.description}</CardContent>
            </Card>
          ))}
        </div>
      </main>
    </section>
  );
}
