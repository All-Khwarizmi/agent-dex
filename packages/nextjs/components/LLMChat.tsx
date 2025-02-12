"use client";

import { useEffect, useRef } from "react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { ScrollArea } from "./ui/ScrollArea";
import { useChat } from "ai/react";

export default function LLMChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [scrollAreaRef, messages]); //Corrected dependency

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI DEX Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea ref={scrollAreaRef} className="h-[400px] w-full pr-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg ${
                  message.role === "assistant" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                }`}
              >
                <strong>{message.role === "assistant" ? "AI: " : "You: "}</strong>
                {message.content}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about DEX operations..."
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardFooter>
    </Card>
  );
}
