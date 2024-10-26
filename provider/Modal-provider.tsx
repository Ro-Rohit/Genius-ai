'use client';
import SubscriptionModal from '@/components/subscription-modal';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';

const ModalProvider: NextPage = () => {
  const [mount, setMount] = useState(false);
  useEffect(() => {
    setMount(true);
  }, []);

  if (!mount) return null;

  return (
    <>
      <SubscriptionModal />
    </>
  );
};

export default ModalProvider;
