import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, HTMLAttributes } from "react";
import type { MessageRole } from "@/lib/api/types/chat.types";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: MessageRole | UIMessage["role"];
  avatar?: React.ReactNode;
  children?: React.ReactNode;
};

export const Message = ({ className, from, avatar, children, ...props }: MessageProps) => {
  const isUser = String(from).toLowerCase() === "user";

  return (
    <div
      className={cn(
        "group flex w-full gap-2 pt-2",
        isUser ? "justify-end" : "justify-start",
        className
      )}
      {...props}
    >
      {isUser ? (
        // Para mensagens do usuário: MessageContent primeiro, depois avatar
        <>
          {children}
          {avatar}
        </>
      ) : (
        // Para mensagens da AI: avatar primeiro, depois MessageContent
        <>
          {avatar}
          {children}
        </>
      )}
    </div>
  );
};

const messageContentVariants = cva(
  "flex flex-col gap-2 overflow-hidden rounded-lg text-sm max-w-[80%] px-4 py-3",
  {
    variants: {
      variant: {
        contained: "",
        flat: "",
      },
    },
    defaultVariants: {
      variant: "contained",
    },
  }
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageContentVariants> & {
    from?: MessageRole | UIMessage["role"];
  };

export const MessageContent = ({
  children,
  className,
  variant,
  from,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      messageContentVariants({ variant, className }),
      String(from).toLowerCase() === "user"
        ? "bg-primary text-primary-foreground ml-auto"
        : "bg-muted text-foreground mr-auto"
    )}
    {...props}
  >
    {children}
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar className={cn("size-8 ring-1 ring-border", className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "ME"}</AvatarFallback>
  </Avatar>
);
