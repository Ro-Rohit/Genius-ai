import { NextPage } from 'next';
import Image from 'next/image';

interface Props {
  loading: boolean;
}

const Loader: NextPage<Props> = ({ loading }) => {
  if (!loading) return null;
  return (
    <div className="mt-auto flex flex-col items-center justify-center gap-y-2 bg-accent py-6">
      <Image
        priority
        src={'/logo.png'}
        alt="Empty"
        height={50}
        width={50}
        className="animate-spin object-contain"
      />
      <p className="text-sm text-muted-foreground">Genius is thinking</p>
    </div>
  );
};

export default Loader;
