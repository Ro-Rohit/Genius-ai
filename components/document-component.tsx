import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { NextPage } from 'next';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('./pdf-viewer'), { ssr: false });
interface Props {
  file: File;
}

const DocumentUploader: NextPage<Props> = ({ file }) => {
  const [fileContents, setFileContents] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const reader = new FileReader();

  if (file.type.includes('text/') || file.type.includes('application/json')) {
    reader.readAsText(file);
  }

  reader.onload = e => {
    const content = e.target?.result as string;
    setFileContents(content);
    setFileType(file.type);
  };

  return (
    <div>
      {file.type === 'application/pdf' && <PDFViewer file={file} />}

      {fileType && fileType.includes('text/') && fileContents && (
        <HighLighter code={fileContents} lang={file.type.split('/')[1]} />
      )}

      {fileType && fileType.includes('application/') && fileContents && (
        <HighLighter code={fileContents} lang={file.type.split('/')[1]} />
      )}
    </div>
  );
};

const HighLighter = ({ code, lang }: { code: string; lang?: string }) => {
  const onCopy = () => {
    toast.success('copied to clipboard.');
    navigator.clipboard.writeText(code);
  };
  return (
    <ScrollArea className="relative h-full max-h-[500px] w-full max-w-[700px] overflow-y-auto py-4">
      <div
        onClick={onCopy}
        className="absolute right-4 top-8 cursor-copy rounded-sm p-2 text-gray-500 transition hover:bg-accent hover:text-gray-700"
      >
        <Copy className="size-5" />
      </div>

      <SyntaxHighlighter
        customStyle={{ height: '100%', width: '100%', overflow: 'visible' }}
        language={lang}
        style={nightOwl}
      >
        {code}
      </SyntaxHighlighter>

      <ScrollBar orientation="horizontal" />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
};

export default DocumentUploader;
