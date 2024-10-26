import { Card, CardContent } from '@/components/ui/card';
import { routes } from '@/lib/constant';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { NextPage } from 'next';
import { Montserrat } from 'next/font/google';
import Link from 'next/link';

const montserrat = Montserrat({
  weight: '600',
  subsets: ['latin'],
});

const Page: NextPage = () => {
  return (
    <section className="mx-auto h-full w-full max-w-lg">
      <div className="mb-12 text-center">
        <h2 className={cn(montserrat.className, 'text-2xl font-bold text-gray-950 md:text-3xl')}>
          Explore the power of AI
        </h2>
        <p className="text-sm text-muted-foreground">
          Chat with the smartest AI -Experience the power of AI
        </p>
      </div>

      <div className="flex flex-col space-y-4">
        {routes.slice(1, 7).map(route => (
          <Link href={route.href} key={route.href}>
            <Card className="transition-all duration-150 hover:drop-shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex h-full items-center gap-x-2">
                  <route.icon
                    className={cn(
                      'size-10 rounded-md bg-emerald-500/10 bg-green-500/10 bg-orange-500/10 bg-pink-500/10 bg-violet-500/10 bg-yellow-500/10 bg-zinc-500/10 p-1.5',
                      route.color,
                      route.iconbg
                    )}
                  />
                  <p className="text-sm font-semibold capitalize text-zinc-800">{route.label}</p>
                </div>

                <ArrowRight className="size-6" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Page;
