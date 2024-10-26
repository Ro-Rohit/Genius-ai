import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { NextPage } from 'next';

interface Props {
  Icon: LucideIcon;
  iconbg: string;
  iconColor: string;
  title: string;
  description: string;
}

const Heading: NextPage<Props> = ({ Icon, iconColor, iconbg, title, description }) => {
  return (
    <div className="flex items-center gap-x-3">
      <Icon
        className={cn(
          'size-12 rounded-md bg-cyan-500/10 bg-emerald-500/10 bg-orange-500/10 bg-pink-500/10 bg-violet-500/10 bg-yellow-500/10 bg-zinc-500/10 p-1.5',
          iconbg,
          iconColor
        )}
      />
      <div>
        <h2 className="text-2xl font-extrabold capitalize">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default Heading;
