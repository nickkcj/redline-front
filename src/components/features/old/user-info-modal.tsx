"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Building2, FolderKanban, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { tokenStore } from "@/lib/auth/stores/auth.store";
import type { User as UserType } from "@/types/common";

export interface UserInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType | null;
  organizationName?: string;
  workspaceName?: string;
}

export function UserInfoModal({
  open,
  onOpenChange,
  user,
  organizationName,
  workspaceName,
}: UserInfoModalProps) {
  const router = useRouter();

  const getUserInitials = React.useCallback(() => {
    if (!user) return "U";
    const name = user.name || user.email || "User";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [user]);

  const handleLogout = React.useCallback(() => {
    tokenStore.clear();
    router.push("/login");
  }, [router]);

  const handleSettings = React.useCallback(() => {
    router.push("/settings");
    onOpenChange(false);
  }, [router, onOpenChange]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Informações do Usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Avatar and Name */}
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {user.name || "Usuário"}
              </h3>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>
          </div>

          <Separator />

          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex size-9 items-center justify-center rounded-lg bg-gray-100">
                <Mail className="size-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                <p className="text-foreground truncate">{user.email}</p>
              </div>
            </div>

            {organizationName && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gray-100">
                  <Building2 className="size-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Organização</p>
                  <p className="text-foreground truncate">{organizationName}</p>
                </div>
              </div>
            )}

            {workspaceName && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gray-100">
                  <FolderKanban className="size-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Workspace Atual</p>
                  <p className="text-foreground truncate">{workspaceName}</p>
                </div>
              </div>
            )}

            {user.id && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gray-100">
                  <User className="size-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">ID do Usuário</p>
                  <p className="text-foreground truncate font-mono text-xs">{user.id}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleSettings}
            >
              <Settings className="size-4" />
              Configurações
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
