'use client'

import { useEffect } from "react"
import useChatStore from "@/store/chat"

interface ConsoleViewProps {
  chatId: string
}

export function ConsoleView({ chatId }: ConsoleViewProps) {
  const logs = useChatStore(state => state.chats[chatId]?.logs || []);

  useEffect(() => {
    console.log('ConsoleView mounted for chat:', chatId)
    console.log('Current logs:', logs)

    return () => {
      console.log('ConsoleView unmounted for chat:', chatId)
    }
  }, [chatId, logs])

  if (!logs || logs.length === 0) {
    return (
      <div className="h-full bg-muted overflow-auto p-4">
        <div className="font-mono text-xs text-muted-foreground">No logs yet...</div>
      </div>
    )
  }

  return (
    <div className="h-full bg-muted overflow-auto p-4">
      <div className="font-mono text-xs space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap">{log}</div>
        ))}
      </div>
    </div>
  );
}
