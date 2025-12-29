"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ResponseProps = {
  children: string | React.ReactNode;
  className?: string;
};

export const Response = memo(
  ({ className, children }: ResponseProps) => {
    const content = typeof children === 'string' ? children : String(children || '');

    return (
      <div className={cn("text-sm text-foreground", className)}>
        <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2">{children}</p>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc list-inside ml-4 mb-2">{children}</ul>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
    );
  }
);

Response.displayName = "Response";
