"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/date.utils";
import { useAuth } from "@/providers/auth-provider";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Loader2 } from "lucide-react";
import { authService } from "@/lib/api/services/auth.service";

interface LoginState {
    isGoogleLoading: boolean;
}

interface LoginFormProps extends React.ComponentProps<"div"> {
    onSuccess?: () => void;
}

export function LoginForm({ className, onSuccess, ...props }: LoginFormProps) {
    const { isLoading } = useAuth();
    const router = useRouter();

    const [state, setState] = React.useState<LoginState>({
        isGoogleLoading: false,
    });

    const handleGoogleLogin = async () => {
        try {
            setState(prev => ({ ...prev, isGoogleLoading: true }));

            const frontendCallbackUrl = `${window.location.origin}/auth/success`;
            const data = await authService.getGoogleOAuthUrl(frontendCallbackUrl);

            if (data.authUrl) {
                window.location.href = data.authUrl;
            } else {
                throw new Error('Auth URL not found');
            }
        } catch (err) {
            console.error('Error getting Google auth URL:', err);
        } finally {
            setState(prev => ({ ...prev, isGoogleLoading: false }));
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Sign in to your account</CardTitle>
                    <CardDescription>
                        Welcome! Please sign in with Google to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <Button
                            type="button"
                            className="w-full"
                            disabled={isLoading || state.isGoogleLoading}
                            onClick={handleGoogleLogin}
                        >
                            {state.isGoogleLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Signing in with Google...
                                </>
                            ) : (
                                <>
                                    <Chrome className="h-4 w-4 mr-2" />
                                    Sign in with Google
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}