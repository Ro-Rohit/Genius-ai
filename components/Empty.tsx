import { NextPage } from 'next';
import Image from 'next/image';

interface Props {
  loading: boolean;
  isDataEmpty: boolean;
  image: string;
  text: string;
}

const Empty: NextPage<Props> = ({ loading, isDataEmpty, image, text }) => {
  if (loading || !isDataEmpty) return null;
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Image priority src={image} alt="Empty" height={250} width={250} />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
};

export default Empty;
