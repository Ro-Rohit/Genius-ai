'use client';

import { useEffect } from 'react';
import { ChatboxColors, Crisp } from 'crisp-sdk-web';
import { useUser } from '@clerk/nextjs';

const CrispChat = () => {
  const { user } = useUser();
  useEffect(() => {
    Crisp.configure(process.env.CRISP_CHAT ?? 'd7a4b2f7-1c81-4fe7-bf70-70fb3b1af6fa');
    Crisp.setColorTheme(ChatboxColors.Purple);
  }, [user?.id]);

  return null;
};

export default CrispChat;
