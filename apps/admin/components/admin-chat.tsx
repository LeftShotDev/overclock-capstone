"use client";

import { useChat } from "@ai-sdk/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminChatProps {
  quizId: string;
  quizName: string;
  className?: string;
}

export function AdminChat({ quizId, quizName, className }: AdminChatProps) {
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
          <h2 className="text-base font-semibold">Admin Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Ask me to read or update quiz settings, questions, personas, characters, or access codes.
          </p>
        </div>
        <Badge variant={isLoading ? "default" : "outline"}>
          {isLoading ? "Thinking..." : "Ready"}
        </Badge>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">
                Ask me anything about your quiz configuration. I can help you
                update settings, manage questions, view personas, and more.
              </p>
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
        onSend={(text) => sendMessage({ text }, { body: { quizId, quizName } })}
        isLoading={isLoading}
        placeholder="Ask about quiz settings, questions, personas..."
      />
    </div>
  );
}
