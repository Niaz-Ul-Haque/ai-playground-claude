'use client';

import { useChatContext } from '@/context/chat-context';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
// ChatSidebar is now integrated into main sidebar (src/components/layout/sidebar.tsx)
// import { ChatSidebar } from './chat-sidebar';
// Unused imports removed since sidebar functionality moved to main layout
// import { Button } from '@/components/ui/button';
// import { PanelLeftClose, PanelLeft } from 'lucide-react';
// import { cn } from '@/lib/utils';

export function ChatContainer() {
  const {
    messages,
    isLoading,
    sendMessage,
    // Session state (Phase 4) - sidebar functionality moved to main layout
    sessions,
    currentSessionId,
    // isSidebarOpen, - no longer needed, sidebar is in main layout
    // createNewSession, - handled by main sidebar
    // selectSession, - handled by main sidebar
    // deleteSession, - handled by main sidebar
    // pinSession, - handled by main sidebar
    // renameSession, - handled by main sidebar
    // searchSessions, - handled by main sidebar
    // toggleSidebar, - handled by main sidebar
  } = useChatContext();

  const handleSend = async (message: string) => {
    await sendMessage(message);
  };

  const handlePromptClick = (prompt: string) => {
    handleSend(prompt);
  };

  // Get current session title for header
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="flex h-full">
      {/* Main Chat Area - Sidebar is now in main layout */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Page header with context info */}
        <div className="border-b bg-background/50 px-4 py-2 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="min-w-0">
              <h1 className="text-sm font-medium truncate">
                {currentSession?.title || 'New Chat'}
              </h1>
              {messages.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        <MessageList
          messages={messages}
          isLoading={isLoading}
          onPromptClick={handlePromptClick}
        />

        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
