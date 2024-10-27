import { useCodeStore } from '@/store/use-code-store';
import { useSpeechStore } from '@/store/use-speech-store';
import { useDescriptorStore } from '@/store/use-descriptor-store';
import { useEffect } from 'react';
import { useImageStore } from '@/store/use-image-store';
import { useDocumentStore } from '@/store/use-document-store';
import { useVisionStore } from '@/store/use-vision-store';

export const useLoadAlert = () => {
  const { history: videoHistory } = useDescriptorStore();
  const { contents: codeHistory } = useCodeStore();
  const { history: DocHistory } = useDocumentStore();
  const { history: musicHistory } = useSpeechStore();
  const { history: imageHistory } = useImageStore();
  const { history: restoreHistory } = useVisionStore();

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    videoHistory.length,
    codeHistory.length,
    DocHistory.length,
    musicHistory.length,
    imageHistory.length,
    restoreHistory.length,
  ]);
};
