import { useState } from 'react';
import dynamic from 'next/dynamic';
import CodeHighlighter from './code-highlighter';

interface Props {
  file: File;
}
const PDFViewer = dynamic(() => import('./pdf-viewer'), { ssr: false });

const DocumentUploader = ({ file }: Props) => {
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
        <CodeHighlighter code={fileContents} lang={file.type.split('/')[1]} />
      )}

      {fileType && fileType.includes('application/') && fileContents && (
        <CodeHighlighter code={fileContents} lang={file.type.split('/')[1]} />
      )}
    </div>
  );
};

export default DocumentUploader;
