import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import { Toaster } from 'sonner';
import ModalProvider from '@/provider/Modal-provider';
import { dark } from '@clerk/themes';

export const metadata: Metadata = {
  title: 'Genius',
  description: 'An AI Software.',
  authors: {
    name: 'rohit.dev',
    url: 'http://ro-rohit.github.io/',
  },
  keywords: ['AI', 'generative ai', 'chatgpt', 'openai', 'image generation', 'genius'],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const CrispWithNoSSR = dynamic(() => import('@/provider/crisp-chat-provider'));

  return (
    <html lang="en" suppressHydrationWarning>
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
