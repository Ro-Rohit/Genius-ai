import { toast } from 'sonner';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy } from 'lucide-react';

interface Props {
  code: string;
  lang?: string;
}

const CodeHighlighter = ({ code, lang }: Props) => {
  const onCopy = () => {
    toast.success('copied to clipboard.');
    navigator.clipboard.writeText(code);
  };
  return (
    <div className="relative h-[450px] w-full max-w-[700px]">
      <div
        onClick={onCopy}
        className="absolute right-4 top-4 z-[50] cursor-copy rounded-sm p-2 text-gray-500 transition hover:bg-accent hover:text-gray-700"
      >
        <Copy className="size-5" />
      </div>

      <ScrollArea className="h-[450px] w-full rounded bg-[#011627] py-4">
        <SyntaxHighlighter language={lang} style={nightOwl}>
          {code}
        </SyntaxHighlighter>
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

export default CodeHighlighter;
