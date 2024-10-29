import { NextPage } from 'next';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface Props {
  text: string;
}

const Markdown: NextPage<Props> = ({ text }) => {
  const extractCode = (children: any) => {
    return Array.isArray(children)
      ? children
          ?.map(child => {
            const val: any =
              typeof child === 'object' ? extractCode(child?.props?.children) : child;
            return val;
          })
          .join('')
      : children;
  };

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeHighlight, rehypeKatex]}
      remarkPlugins={[remarkGfm]}
      components={{
        pre: ({ ...props }) => (
          <div className="my-2 w-full max-w-full rounded-lg bg-black/10 p-2">
            <pre className="whitespace-pre-wrap" {...props} />
          </div>
        ),
        code: ({ ...props }) => {
          const { children, className } = props;
          const match = /language-(\w+)/.exec(className || '');
          const code = extractCode(children);

          return match ? (
            <SyntaxHighlighter PreTag="div" language={match[1]} style={nightOwl}>
              {code}
            </SyntaxHighlighter>
          ) : (
            <code className="rounded-lg bg-black/10 p-1" {...props} />
          );
        },
      }}
      className={'overflow-hidden text-sm leading-7'}
    >
      {text}
    </ReactMarkdown>
  );
};

export default Markdown;
