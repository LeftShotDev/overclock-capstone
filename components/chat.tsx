"use client";

import { useChat } from "@ai-sdk/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { Badge } from "@/components/ui/badge";

export function Chat() {
  const { messages, status, sendMessage, error } = useChat();
  const isLoading = status === "streaming" || status === "submitted";

  const scrollRef = useScrollToBottom<HTMLDivElement>([messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-2xl mx-auto border rounded-xl overflow-hidden bg-background shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h1 className="text-lg font-semibold">Teaching Persona Quiz</h1>
          <p className="text-sm text-muted-foreground">
            Discover your teaching style
          </p>
        </div>
        <Badge variant={isLoading ? "default" : "outline"}>
          {isLoading ? "Thinking..." : "Ready"}
        </Badge>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-16">
              <p className="text-2xl font-semibold mb-2">
                What Kind of Professor Are You?
              </p>
              <p className="text-sm">
                Take this quick quiz to discover your teaching persona and get
                personalized courseware recommendations.
              </p>
              <p className="text-sm mt-4 text-muted-foreground/70">
                Type anything to get started!
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

      <ChatInput onSend={(text) => sendMessage({ text })} isLoading={isLoading} />
    </div>
  );
}
