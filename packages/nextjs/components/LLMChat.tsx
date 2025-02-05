"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Input } from "./ui/Input";
import { ScrollArea } from "./ui/ScrollArea";
import { Button } from "./ui/button";
import { useChat } from "ai/react";

export default function LLMChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI DEX Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          {messages.map((message, i) => (
            <div key={i} className={`mb-4 ${message.role === "assistant" ? "text-blue-600" : "text-green-600"}`}>
              <strong>{message.role === "assistant" ? "AI: " : "You: "}</strong>
              {message.content}
            </div>
          ))}
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
