import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
interface Props {
  url: string;
  isDownloadabe?: boolean;
}

const ImageCard = ({ url, isDownloadabe = false }: Props) => {
  return (
    <Card className="w-full max-w-[300px] rounded-md">
      <CardContent className="relative mb-2 p-2">
        <img
          onClick={() => window.open(url, '_blank')}
          src={url}
          className="aspect-auto w-full cursor-pointer rounded-md object-contain"
        />
      </CardContent>
      {isDownloadabe && (
        <CardFooter className="my-0">
          <Button asChild variant={'default'} size={'lg'} className="w-full cursor-pointer">
            <a
              href={url}
              download={'ai_image_' + url.split('/').pop()}
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center gap-x-3"
            >
              <Download className="size-4" />
              <span>Download</span>
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ImageCard;
