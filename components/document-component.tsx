import { useState } from 'react';
import PDFViewer from './pdf-viewer';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { NextPage } from 'next';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

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
    <ScrollArea className="relative h-full max-h-[500px] w-full py-4">
      <Button
        onClick={onCopy}
        size={'sm'}
        variant={'ghost'}
        asChild
        className="absolute right-1 top-1 z-10 cursor-copy"
      >
        <Copy className="size-5" />
      </Button>
      <SyntaxHighlighter language={lang} style={nightOwl}>
        {code}
      </SyntaxHighlighter>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default DocumentUploader;
