'use client';
import { NextPage } from 'next';
import { useState } from 'react';
import { Input } from './ui/input';
import { Edit } from 'lucide-react';
import { Button } from './ui/button';
import Markdown from './markdown';

interface Props {
  isEditable?: boolean;
  text: string;
  onSubmit: (value: string) => void;
}

const TextField: NextPage<Props> = ({ isEditable = true, text, onSubmit }) => {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState<string>(text);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(value);
    setEdit(false);
  };

  const handleCancel = () => {
    setValue(text);
    setEdit(false);
  };

  if (!isEditable) {
    return <p>{value}</p>;
  }

  return (
    <div className="group h-full w-full self-center">
      {!edit && (
        <div className="relative flex w-full items-center gap-x-1.5">
          <Markdown text={value} />
          <div className="mb-3 flex h-10 w-10 cursor-pointer items-center justify-center self-start rounded-full bg-transparent text-muted-foreground opacity-50 transition-all duration-100 hover:bg-muted-foreground/70 hover:text-white group-hover:opacity-100">
            <Edit onClick={() => setEdit(true)} className="size-4" />
          </div>
        </div>
      )}
      {edit && (
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col justify-between gap-y-8 rounded-2xl bg-slate-500 p-4"
        >
          <Input
            className="outline-none ring-0 ring-transparent focus-visible:ring-0 focus-visible:ring-transparent"
            onChange={e => setValue(e.target.value)}
            required
            value={value}
            type="text"
            placeholder="Enter your message"
          />
          <div className="flex w-full justify-end gap-x-4">
            <Button type="submit" className="cursor-pointer rounded-md">
              Submit
            </Button>
            <Button
              type="reset"
              onClick={handleCancel}
              className="cursor-pointer rounded-md"
              variant={'outline'}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TextField;
