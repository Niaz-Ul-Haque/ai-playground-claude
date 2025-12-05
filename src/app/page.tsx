'use client';

import { ChatProvider } from '@/context/chat-context';
import { ChatContainer } from '@/components/chat';

export default function Home() {
  return (
    <ChatProvider>
      <ChatContainer />
    </ChatProvider>
  );
}
