import { NextPage } from 'next';
import Image from 'next/image';

interface Props {
  imagurl?: string;
  name?: string;
}

const Avator: NextPage<Props> = ({ imagurl, name = '' }) => {
  if (imagurl) {
    return <Image src={imagurl} alt="user" height={30} width={30} className="rounded-full" />;
  }

  return (
    <div className="flex size-10 items-center justify-center bg-sky-500">
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

export default Avator;
