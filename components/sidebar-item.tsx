import { useGetStore } from '@/lib/constant';
import { cn } from '@/lib/utils';
import { LucideIcon, Trash } from 'lucide-react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Button } from './ui/button';
import PreferenceModal from './preference-modal';
import { useState } from 'react';

interface Props {
  Active: boolean;
  label: string;
  Icon: LucideIcon;
  href: string;
  color: string;
}

const SidebarItem: NextPage<Props> = ({ href, color, label, Active, Icon }) => {
  const { history, clearHistory, isStreaming } = useGetStore(label);
  const [open, setOpen] = useState(false);

  return (
    <>
      <PreferenceModal open={open} setOpen={setOpen} onDelete={clearHistory} title={label} />
      <Link
        href={href}
        className={cn(
          'group flex items-center justify-between gap-x-3 overflow-hidden rounded-md p-2.5 hover:bg-white/10',
          Active && 'bg-white/10'
        )}
      >
        <div className="flex items-center">
          <Icon
            className={cn(
              'mr-3 size-6 text-cyan-500 text-emerald-500 text-orange-500 text-pink-500 text-sky-500 text-violet-500 text-yellow-500 text-zinc-300',
              color
            )}
          />
          <p
            className={cn(
              'truncate text-sm font-semibold group-hover:text-white',
              Active ? 'text-white' : 'text-zinc-400'
            )}
          >
            {label}
          </p>
        </div>
        {!!history.length && (
          <Button
            className="group p-2"
            variant={'destructive'}
            size={'icon'}
            disabled={isStreaming}
            onClick={() => setOpen(!open)}
          >
            <Trash className="size-4 scale-125 transition-all" />
          </Button>
        )}
      </Link>
    </>
  );
};

export default SidebarItem;
