import { NextPage } from 'next';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useSheetStore } from '@/store/sheet-store';
import Sidebar from './sidebar';

const MobileSidebar: NextPage = () => {
  const { open, setIsOpen } = useSheetStore();
  return (
    <Sheet open={open} onOpenChange={setIsOpen}>
      <SheetContent side={'left'} className="bg-gray-900">
        <SheetTitle className="hidden"></SheetTitle>
        <SheetDescription className="hidden"></SheetDescription>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
