'use client';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { NextPage } from 'next';

interface Props {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode;
}

const CollapsibleComponent: NextPage<Props> = ({ open, onOpenChange, children }) => {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="w-full">
      <CollapsibleContent className="w-full">{children}</CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleComponent;
