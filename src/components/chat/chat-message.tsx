"use client";

import * as React from "react";
import { cn } from "@/lib/utils/date.utils";
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
        "group relative flex gap-4 py-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div className={cn("flex gap-3 max-w-[85%]", isUser && "flex-row-reverse")}>
        {/* Avatar */}
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full flex-shrink-0",
            isUser
              ? "bg-gray-700 text-white"
              : "bg-gray-900 text-white"
          )}
        >
          {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
        </div>

        {/* Content */}
        <div className={cn("flex flex-col gap-2 flex-1 min-w-0")}>
          {/* Documents badges */}
          {documents && documents.length > 0 && (
            <div className={cn("flex flex-wrap gap-1.5", isUser && "justify-end")}>
              {documents.map((doc) => (
                <Badge key={doc.id} variant="secondary" className="text-xs font-normal bg-blue-50 text-blue-700 hover:bg-blue-100">
                  <FileText className="mr-1 size-3" />
                  {doc.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Message content */}
          {isUser ? (
            <div className="rounded-2xl px-4 py-3 text-sm bg-background border border-border shadow-sm">
              <p className="whitespace-pre-wrap break-words leading-relaxed text-gray-900">{content}</p>
            </div>
          ) : (
            <div className="text-sm">
              <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-900 prose-p:leading-relaxed prose-strong:text-gray-900 prose-code:text-gray-900 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-ul:text-gray-900 prose-ol:text-gray-900 prose-li:text-gray-900">
                <ReactMarkdown>{content}</ReactMarkdown>
                {isStreaming && (
                  <span className="inline-flex items-center gap-0.5 ml-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
