"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
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
    <nav className="border-b border-gray-200 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image
                src="/seloDooorBlack.png"
                alt="Dooor Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-serif font-bold text-foreground leading-tight">{appName}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-gray-700 hover:text-foreground hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

