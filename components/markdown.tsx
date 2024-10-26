import { NextPage } from 'next';
import ReactMarkdown from 'react-markdown';

interface Props {
  text: string;
}

const Markdown: NextPage<Props> = ({ text }) => {
  return (
    <ReactMarkdown
      components={{
        pre: ({ ...props }) => (
          <div className="my-2 w-full overflow-y-auto rounded-lg bg-black/10 p-2">
            <pre {...props} />
          </div>
        ),
        code: ({ ...props }) => <code className="rounded-lg bg-black/10 p-1" {...props} />,
      }}
      className={'overflow-hidden text-sm leading-7'}
    >
      {text}
    </ReactMarkdown>
  );
};

export default Markdown;
