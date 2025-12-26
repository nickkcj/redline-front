"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { User, Bot, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  documents?: Array<{ id: string; name: string }>;
  className?: string;
}

export function ChatMessage({
  role,
  content,
  isStreaming = false,
  documents,
  className,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "group relative flex gap-4 py-6",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div className={cn("flex gap-3 max-w-[80%]", isUser && "flex-row-reverse")}>
        {/* Avatar */}
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-gray-100 text-gray-700"
          )}
        >
          {isUser ? <User className="size-4" /> : <Bot className="size-5" />}
        </div>

        {/* Content */}
        <div className={cn("flex flex-col gap-2 flex-1 min-w-0")}>
          {/* Documents badges */}
          {documents && documents.length > 0 && (
            <div className={cn("flex flex-wrap gap-1.5", isUser && "justify-end")}>
              {documents.map((doc) => (
                <Badge key={doc.id} variant="secondary" className="text-xs font-normal">
                  <FileText className="mr-1 size-3" />
                  {doc.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Message content */}
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm shadow-sm",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-gray-50 text-gray-900 border border-gray-200"
            )}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap break-words leading-relaxed">{content}</p>
            ) : (
              <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100">
                <ReactMarkdown>{content}</ReactMarkdown>
                {isStreaming && (
                  <span className="inline-flex items-center gap-0.5 ml-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
