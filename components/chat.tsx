"use client";

import { useChat } from "@ai-sdk/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChatProps {
  title?: string;
  description?: string;
  placeholder?: string;
  emptyMessage?: string;
  body?: Record<string, unknown>;
  className?: string;
}

export function Chat({
  title = "Chat",
  description,
  placeholder = "Type a message...",
  emptyMessage = "Send a message to get started.",
  body,
  className,
}: ChatProps) {
  const { messages, status, sendMessage, error } = useChat();
  const isLoading = status === "streaming" || status === "submitted";

  const scrollRef = useScrollToBottom<HTMLDivElement>([messages]);

  return (
    <div
      className={cn(
        "flex flex-col border rounded-xl overflow-hidden bg-background shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Badge variant={isLoading ? "default" : "outline"}>
          {isLoading ? "Thinking..." : "Ready"}
        </Badge>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">{emptyMessage}</p>
            </div>
          )}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-t">
          Error: {error.message}
        </div>
      )}

      <ChatInput
        onSend={(text) => sendMessage({ text }, { body })}
        isLoading={isLoading}
        placeholder={placeholder}
      />
    </div>
  );
}
