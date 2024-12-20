import { useCodeStore } from '@/store/use-code-store';
import { useDocumentStore } from '@/store/use-document-store';
import { useDescriptorStore } from '@/store/use-descriptor-store';
import { useImageStore } from '@/store/use-image-store';
import { useSpeechStore } from '@/store/use-speech-store';
import { useVisionStore } from '@/store/use-vision-store';
import {
  LayoutDashboard,
  MessageSquare,
  ImageIcon,
  Music,
  Code,
  Settings,
  VideoIcon,
  LetterText,
} from 'lucide-react';

export const MAX_COUNT = 5;
export const BATCH_SIZE = 15;
export const SPEED = 7;

export const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    color: 'text-sky-500',
    href: '/dashboard',
    iconbg: 'bg-sky-500/10',
    description: 'welcome to  Genius AI',
  },
  {
    label: 'Code Generation',
    icon: Code,
    color: 'text-cyan-500',
    href: '/code',
    iconbg: 'bg-cyan-500/10',
    description: 'Generates code in for you.',
  },
  {
    label: 'Descriptor',
    icon: MessageSquare,
    color: 'text-violet-500',
    href: '/descriptor',
    iconbg: 'bg-violet-500/10',
    description: 'Our most advanced conversation model',
  },
  {
    label: 'Document',
    icon: LetterText,
    color: 'text-orange-500',
    href: '/document',
    iconbg: 'bg-orange-500/10',
    description: 'Summarise thr document content',
  },

  {
    label: 'Image Generation',
    icon: ImageIcon,
    color: 'text-pink-500',
    href: '/image',
    iconbg: 'bg-pink-500/10',
    description: 'Our most advanced Image generation model',
  },

  {
    label: 'Speech Recognition',
    icon: Music,
    color: 'text-emerald-500',
    href: '/speech',
    iconbg: 'bg-emerald-500/10',
    description: 'Summarize the audio content',
  },
  {
    label: 'Vision',
    icon: VideoIcon,
    color: 'text-yellow-500',
    href: '/vision',
    iconbg: 'bg-yellow-500/10',
    description: 'Summarize the video content',
  },
  {
    label: 'Settings',
    icon: Settings,
    color: 'text-zinc-300',
    href: '/settings',
    iconbg: 'bg-zinc-500/10',
    description: 'Manage your subscription',
  },
];

type testimonialType = {
  name: string;
  avatar: string;
  title: string;
  description: string;
};

export const testimonialData: Array<testimonialType> = [
  {
    name: 'Alex',
    avatar: 'AL',
    title: 'Full Stack Developer',
    description: 'This platform has transformed how I manage my projects. Highly recommend it!',
  },
  {
    name: 'Priya',
    avatar: 'PR',
    title: 'Product Designer',
    description: 'The user experience here is unmatched. The tools are intuitive and powerful.',
  },
  {
    name: 'Jordan',
    avatar: 'JO',
    title: 'Data Scientist',
    description:
      "This is hands down the most efficient application I've ever used for data analysis.",
  },
  {
    name: 'Emily',
    avatar: 'EM',
    title: 'Marketing Specialist',
    description:
      'The application simplifies complex tasks. It has boosted my productivity tremendously!',
  },
  {
    name: 'Michael',
    avatar: 'MI',
    title: 'Tech Lead',
    description: 'Superb functionality and easy to integrate with our existing tech stack.',
  },
  {
    name: 'Sophia',
    avatar: 'SO',
    title: 'UX Designer',
    description:
      "I've never seen such a well-thought-out design. This app is a joy to use every day!",
  },
  {
    name: 'Ethan',
    avatar: 'ET',
    title: 'DevOps Engineer',
    description: 'Seamless deployment and management—this app is a game-changer for my workflow.',
  },
  {
    name: 'Liam',
    avatar: 'LI',
    title: 'Frontend Developer',
    description: 'From the performance to the interface, everything about this app is top-notch.',
  },
];

type StoreType = {
  history: Array<any>;
  clearHistory: () => void;
  isStreaming: boolean;
};

export const useGetStore = (label: string): StoreType => {
  let isStreaming = false;
  let store: any;
  let history = <any>[];
  let clearHistory = () => {};
  switch (label) {
    case 'Document':
      store = useDocumentStore();
      isStreaming = store.isStreaming;
      history = store.history;
      clearHistory = store.clearHistory;
      return { isStreaming, history, clearHistory };

    case 'Image Generation':
      store = useImageStore();
      history = store.history;
      clearHistory = store.clearHistory;
      return { isStreaming, history, clearHistory };

    case 'Descriptor':
      store = useDescriptorStore();
      isStreaming = store.isStreaming;
      history = store.history;
      clearHistory = store.clearHistory;
      return { isStreaming, history, clearHistory };

    case 'Speech Recognition':
      store = useSpeechStore();
      isStreaming = store.isStreaming;
      history = store.history;
      clearHistory = store.clearHistory;
      return { isStreaming, history, clearHistory };

    case 'Code Generation':
      store = useCodeStore();
      isStreaming = store.isStreaming;
      history = store.contents;
      clearHistory = store.clearContents;
      return { isStreaming, history, clearHistory };

    case 'Vision':
      store = useVisionStore();
      isStreaming = store.isStreaming;
      history = store.history;
      clearHistory = store.clearHistory;
      return { isStreaming, history, clearHistory };

    default:
      return { isStreaming, history, clearHistory };
  }
};
