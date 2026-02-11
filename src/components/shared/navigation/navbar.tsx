"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { SignOut } from "@phosphor-icons/react";

export function Navbar() {
  const router = useRouter();
  const { logout } = useAuth();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Redline";

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/login');
    }
  };

  return (
    <nav className="border-b border-border bg-background">
      <div className="flex items-center justify-end h-12 px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5 text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
        >
          <SignOut weight="bold" className="h-3.5 w-3.5" />
          Sair
        </Button>
      </div>
    </nav>
  );
}
