'use client';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SidebarItem from './sidebar-item';
import { Montserrat } from 'next/font/google';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { routes } from '@/lib/constant';
import FreeCounter from './free-counter';

const montserrat = Montserrat({
  weight: '600',
  subsets: ['latin'],
});

const Sidebar: NextPage = () => {
  const pathname = usePathname();

  return (
    <aside className="scrollable-content h-full w-full">
      <div className="h-full w-full">
        <Link href={'/dashboard'} className="flex cursor-pointer items-center gap-x-3">
          <Image src={'/logo.png'} height={30} width={30} alt="Genius" />
          <h4 className={cn(montserrat.className, 'text-2xl font-semibold text-white')}>Genius</h4>
        </Link>

        <div className="flex flex-col space-y-1 overflow-y-auto pt-5">
          {routes.map(route => (
            <SidebarItem
              label={route.label}
              Icon={route.icon}
              href={route.href}
              color={route.color}
              key={route.href}
              Active={route.href === pathname}
            />
          ))}
        </div>

        <FreeCounter />
      </div>
    </aside>
  );
};

export default Sidebar;
