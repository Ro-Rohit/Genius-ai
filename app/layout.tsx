import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import { Toaster } from 'sonner';
import ModalProvider from '@/provider/Modal-provider';
import { dark } from '@clerk/themes';
import Head from 'next/head';

export const metadata: Metadata = {
  title: 'Genius',
  description: 'An AI Software.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const CrispWithNoSSR = dynamic(() => import('@/provider/crisp-chat-provider'));

  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ClerkProvider appearance={{ baseTheme: dark }} afterMultiSessionSingleSignOutUrl={'/'}>
        <CrispWithNoSSR />
        <ModalProvider />
        <body className="">
          <Toaster position="top-center" theme="system" />
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
