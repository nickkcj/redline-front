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
  name?: string;
  children?: React.ReactNode;
};

export const Message = ({ className, from, avatar, name, children, ...props }: MessageProps) => {
  const isUser = String(from).toLowerCase() === "user";

  return (
    <div
      className={cn(
        "group flex w-full gap-2 pt-2",
        isUser ? "justify-end" : "flex-col items-start",
        className
      )}
      {...props}
    >
      {isUser ? (
        // Para mensagens do usuário: MessageContent primeiro (sem avatar)
        <>
          {children}
        </>
      ) : (
        // Para mensagens da AI: avatar e nome na linha de cima, conteúdo abaixo
        <>
          <div className="flex items-center gap-2 select-none">
            {avatar}
            {name && <span className="text-sm font-medium">{name}</span>}
          </div>
          <div className="pl-0 w-full">
            {children}
          </div>
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
}: MessageContentProps) => {
  const isUser = String(from).toLowerCase() === "user";
  const isFlat = variant === "flat";

  return (
    <div
      className={cn(
        messageContentVariants({ variant, className }),
        isUser
          ? "bg-primary text-primary-foreground ml-auto"
          : isFlat
            ? "bg-transparent text-foreground p-0 max-w-none"
            : "bg-muted text-foreground mr-auto"
      )}
      {...props}
    >
      {children}
    </div>
  );
};

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
