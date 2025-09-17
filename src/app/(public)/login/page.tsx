"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useAuthGuard } from "@/lib/auth/hooks/use-auth-guard";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Redirect authenticated users
  useAuthGuard({
    redirectAuthenticated: true,
    redirectUnauthenticated: false,
  });

  const handleLoginSuccess = () => {
    const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
    router.push(returnUrl || '/dashboard');
  };

  const handleRegisterClick = () => {
    const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
    const params = returnUrl ? `?returnUrl=${returnUrl}` : '';
    router.push(`/register${params}`);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="absolute top-4 right-4"
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      <div className="w-full max-w-sm">
        <LoginForm onSuccess={handleLoginSuccess} />

      </div>
    </div>
  );
}