import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { NextPage } from 'next';
import { Button } from './ui/button';

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  title?: string;
  onDelete: () => void;
}

const PreferenceModal: NextPage<Props> = ({ title, onDelete, open, setOpen }) => {
  const handleDelete = () => {
    onDelete();
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {title}</DialogTitle>
          <DialogDescription>Do you want to delete all the conversation?</DialogDescription>
          <DialogFooter className="flex items-center gap-x-4">
            <Button onClick={() => setOpen(false)} variant={'outline'}>
              Cancel
            </Button>
            <Button onClick={handleDelete} variant={'destructive'}>
              Delete
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PreferenceModal;
