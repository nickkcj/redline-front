"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Copy, Check } from "lucide-react";
import Image from "next/image";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem
} from "@/components/ai-elements/prompt-input";
import { useTheme } from "next-themes";

type ModelKey = "claude" | "gemini" | "gpt";

const MODEL_CONFIG = {
  claude: {
    key: "claude" as ModelKey,
    name: "Claude 4 Sonnet",
    icon: "/Claude_AI_symbol.svg.png",
  },
  gemini: {
    key: "gemini" as ModelKey,
    name: "Gemini 2.5 Pro",
    icon: "/Gemini-Icon.png.webp",
  },
  gpt: {
    key: "gpt" as ModelKey,
    name: "GPT-5",
    icon: "/ChatGPT-Logo.svg.png",
  },
};

export default function AiChatPage() {
  const [input, setInput] = useState("");
  const [currentModel, setCurrentModel] = useState<ModelKey>("claude");
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const docsCount = 156; // Mock document count

  const handleQuickAction = (prompt: string) => {
    setInput("");
    handleSendMessage(prompt);
  };

  const handleSendMessage = (text: string) => {
    console.log("Sending message:", text, "with model:", currentModel);
    // Here you would integrate with your AI service
    // For now, just log the message
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-8 py-6">
      <div className="w-full max-w-2xl">
        {/* Welcome Section */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            How can I help you today?
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Ask me anything about the {docsCount} documents in this data room
          </p>
        </div>

        {/* Quick Actions */}
        {docsCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <Button
              variant="outline"
              className="h-auto p-6 text-left justify-start hover:bg-accent/50 hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20"
              onClick={() => handleQuickAction("Summarize the key points from all documents")}
            >
              <div>
                <div className="font-semibold text-base mb-1">
                  📄 Summarize documents
                </div>
                <div className="text-sm text-muted-foreground">
                  Get an overview of all documents
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 text-left justify-start hover:bg-accent/50 hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20"
              onClick={() => handleQuickAction("What are the main topics covered in these documents?")}
            >
              <div>
                <div className="font-semibold text-base mb-1">
                  🔍 Explore topics
                </div>
                <div className="text-sm text-muted-foreground">
                  Discover key themes and topics
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 text-left justify-start hover:bg-accent/50 hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20"
              onClick={() => handleQuickAction("Find all mentions of financial data and create a summary")}
            >
              <div>
                <div className="font-semibold text-base mb-1">
                  💰 Financial insights
                </div>
                <div className="text-sm text-muted-foreground">
                  Extract financial information
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 text-left justify-start hover:bg-accent/50 hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20"
              onClick={() => handleQuickAction("Identify any risks or concerns mentioned in the documents")}
            >
              <div>
                <div className="font-semibold text-base mb-1">
                  ⚠️ Risk analysis
                </div>
                <div className="text-sm text-muted-foreground">
                  Identify potential risks
                </div>
              </div>
            </Button>
          </div>
        )}

        {/* Main Chat Input */}
        <PromptInput
          onSubmit={(message, e) => {
            e.preventDefault();
            const text = message.text?.trim();
            if (!text) return;
            setInput("");
            handleSendMessage(text);
          }}
          className="relative"
        >
          <PromptInputTextarea
            ref={inputRef as any}
            placeholder="Ask or find anything from your documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="text-base"
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputModelSelect value={currentModel} onValueChange={(value) => setCurrentModel(value as ModelKey)}>
                <PromptInputModelSelectTrigger>
                  <div className="flex items-center gap-2">
                    <Image
                      src={MODEL_CONFIG[currentModel].icon}
                      alt={MODEL_CONFIG[currentModel].name}
                      width={20}
                      height={20}
                      className="rounded"
                    />
                    <span className="hidden sm:inline">
                      {MODEL_CONFIG[currentModel].name}
                    </span>
                  </div>
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {Object.values(MODEL_CONFIG).map((model) => (
                    <PromptInputModelSelectItem key={model.key} value={model.key}>
                      <div className="flex items-center gap-2">
                        <Image
                          src={model.icon}
                          alt={model.name}
                          width={20}
                          height={20}
                          className="rounded"
                        />
                        {model.name}
                      </div>
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!input.trim()}
            />
          </PromptInputToolbar>
        </PromptInput>

        {/* Additional Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to send,
            <kbd className="px-2 py-1 bg-muted rounded text-xs ml-1">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}