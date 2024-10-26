'use client';
import { getUserApiCount } from '@/actions/get-api-count';
import { getSubscriptionLimit } from '@/actions/get-subscription-data';
import { insertUserApiLmit } from '@/actions/insert-api-count';
import MobileSidebar from '@/components/mobile-sidebar';
import Sidebar from '@/components/sidebar';
import { isNewDay } from '@/lib/utils';
import { useSheetStore } from '@/store/sheet-store';
import { useCountStore } from '@/store/use-count-store';
import { ClerkLoaded, ClerkLoading, UserButton, useUser } from '@clerk/nextjs';
import { Loader, Menu } from 'lucide-react';
import { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

const DashboardLayout: NextPage<Props> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { open, setIsOpen } = useSheetStore();
  const { setCount, setIsPro } = useCountStore();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (user) {
      const data = await getUserApiCount(user?.id);
      if (isNewDay(new Date(data?.updated_at))) {
        await insertUserApiLmit(user.id, 0);
        setCount(0);
      } else {
        if (data) setCount(data.count);
      }

      const pro = await getSubscriptionLimit(user.id);
      if (pro !== null) setIsPro(pro);
    }
  }, [user, setCount, setIsPro]);

  useEffect(() => {
    fetchData();
  }, [fetchData, isLoaded, user]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) return null;

  return (
    <div className="relative h-full">
      <div className="bottom-0 left-0 top-0 hidden w-72 bg-gray-900 p-4 md:fixed md:flex md:flex-col">
        <Sidebar />
      </div>

      <MobileSidebar />

      <div className="h-full w-full p-3 md:pl-72">
        <header className="flex items-center">
          <Menu
            onClick={() => {
              setIsOpen(!open);
            }}
            className="size-6 cursor-pointer pb-1 md:hidden"
          />
          <div className="ml-auto cursor-pointer pt-2">
            <ClerkLoading>
              <Loader className="size-6 animate-spin" />
            </ClerkLoading>
            <ClerkLoaded>
              <UserButton />
            </ClerkLoaded>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
