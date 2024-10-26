import { NextPage } from 'next';

interface Props {
  children: React.ReactNode;
}

const Layout: NextPage<Props> = ({ children }) => {
  return (
    <div className="flex h-[100vh] w-full items-center justify-center bg-slate-950">{children}</div>
  );
};

export default Layout;
