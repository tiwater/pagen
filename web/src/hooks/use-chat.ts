import { useEffect, useState } from 'react';
import useChatStore from '@/store/chat';
import type { Chat } from '@/types/chat';

export function useChat(id: string) {
  const [isLoading, setIsLoading] = useState(true);
  const chat = useChatStore(state => state.chats[id]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkChat = () => {
      const isReady = useChatStore.persist.hasHydrated();
      if (isReady) {
        setIsLoading(false);
      } else {
        timeoutId = setTimeout(checkChat, 50);
      }
    };

    checkChat();
    return () => clearTimeout(timeoutId);
  }, []);

  return {
    chat,
    isLoading
  };
}
