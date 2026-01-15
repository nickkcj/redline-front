"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { logout } = useAuth();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "App Name";

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
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 flex-shrink-0">
              <Image
                src="/seloDooorBlack.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-sm font-medium text-foreground">{appName}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-muted-foreground hover:text-foreground h-7 px-2 text-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </Button>
        </div>
      </div>
    </nav>
  );
}
