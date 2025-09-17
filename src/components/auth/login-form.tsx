"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/auth-context";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome, Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "@/lib/api/services/auth.service";

const STEP_CREDENTIALS = 'credentials';
const STEP_TWO_FA = 'two-fa';

type LoginStep = typeof STEP_CREDENTIALS | typeof STEP_TWO_FA;

interface LoginState {
    step: LoginStep;
    email: string;
    password: string;
    isResending: boolean;
    showForgotPassword: boolean;
    isGoogleLoading: boolean;
    showEmailVerification: boolean;
}

const LoginCredentialsSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

const TwoFaSchema = z.object({
    code: z.string()
        .min(6, "Verification code must be 6 digits")
        .max(6, "Verification code must be 6 digits")
        .regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

type LoginCredentialsValues = z.infer<typeof LoginCredentialsSchema>;
type TwoFaValues = z.infer<typeof TwoFaSchema>;

function handleAuthError(err: unknown): string {
    const anyErr = err as any;
    const message = anyErr?.message || anyErr?.response?.data?.message || anyErr?.response?.data?.error || anyErr?.error;
    const status = anyErr?.statusCode || anyErr?.status || anyErr?.response?.status;

    switch (status) {
        case 401:
            return "Invalid email or password";
        case 400:
            return message || "Invalid verification code";
        case 409:
            return "Email already registered";
        case 404:
            return "User not found";
        default:
            return message || "Login failed. Please try again.";
    }
}

function CredentialsStep({
    onSubmit,
    onForgotPassword,
    onGoogleLogin,
    isLoading,
    isGoogleLoading
}: {
    onSubmit: (values: LoginCredentialsValues) => Promise<void>;
    onForgotPassword: () => void;
    onGoogleLogin: () => void;
    isLoading: boolean;
    isGoogleLoading: boolean;
}) {
    const [showPassword, setShowPassword] = React.useState(false);
    const form = useForm<LoginCredentialsValues>({
        resolver: zodResolver(LoginCredentialsSchema),
        defaultValues: { email: "", password: "" },
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const handleSubmit = async (values: LoginCredentialsValues) => {
        try {
            await onSubmit(values);
        } catch (err) {
            const message = handleAuthError(err);
            form.setError("root", { message });
        }
    };

    const onInvalid = () => {
        form.setError("root", { message: "Please fix the errors above" });
    };

    return (
        <form onSubmit={form.handleSubmit(handleSubmit, onInvalid)} noValidate>
            <div className="flex flex-col gap-6">
                {form.formState.errors.root?.message && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                        {form.formState.errors.root.message}
                    </div>
                )}

                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        autoFocus
                        {...form.register("email")}
                        aria-invalid={!!form.formState.errors.email}
                    />
                    <div className="h-4">
                        {form.formState.errors.email && (
                            <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid gap-3">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <button
                            type="button"
                            className="ml-auto inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
                            onClick={onForgotPassword}
                            disabled={isLoading}
                        >
                            Forgot password?
                        </button>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            {...form.register("password")}
                            aria-invalid={!!form.formState.errors.password}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            className="absolute right-1 top-1 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <div className="h-4">
                        {form.formState.errors.password && (
                            <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isLoading || isGoogleLoading}
                        onClick={onGoogleLogin}
                    >
                        {isGoogleLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Loading Google...
                            </>
                        ) : (
                            <>
                                <Chrome className="h-4 w-4 mr-2" />
                                Sign in with Google
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="mt-4 text-center text-sm">
                Don't have an account?{" "}
                <a href="/register" className="underline underline-offset-4">
                    Sign up
                </a>
            </div>
        </form>
    );
}

function TwoFactorStep({
    email,
    onSubmit,
    onResendCode,
    onBack,
    isLoading,
    isResending
}: {
    email: string;
    onSubmit: (values: TwoFaValues) => Promise<void>;
    onResendCode: () => Promise<void>;
    onBack: () => void;
    isLoading: boolean;
    isResending: boolean;
}) {
    const form = useForm<TwoFaValues>({
        resolver: zodResolver(TwoFaSchema),
        defaultValues: { code: "" },
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const handleSubmit = async (values: TwoFaValues) => {
        try {
            await onSubmit(values);
        } catch (err) {
            const message = handleAuthError(err);
            form.setError("root", { message });
        }
    };

    const handleResendCode = async () => {
        try {
            form.setError("root", { message: "" });
            await onResendCode();
        } catch (err) {
            const message = handleAuthError(err);
            form.setError("root", { message });
        }
    };

    const onInvalid = () => {
        form.setError("root", { message: "Please fix the errors above" });
    };

    return (
        <form onSubmit={form.handleSubmit(handleSubmit, onInvalid)} noValidate>
            <div className="flex flex-col gap-6">
                {form.formState.errors.root?.message && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                        {form.formState.errors.root.message}
                    </div>
                )}

                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        We've sent a verification code to your email
                    </p>
                    <p className="mt-1 text-sm font-medium">{email}</p>
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                        id="code"
                        type="text"
                        placeholder="Enter 6-digit code"
                        autoComplete="one-time-code"
                        autoFocus
                        maxLength={6}
                        {...form.register("code")}
                        aria-invalid={!!form.formState.errors.code}
                        className="text-center tracking-widest"
                    />
                    <div className="h-4">
                        {form.formState.errors.code && (
                            <p className="text-xs text-red-600">{form.formState.errors.code.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify & Sign in"
                        )}
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onBack}
                            disabled={isLoading}
                        >
                            Back to login
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={handleResendCode}
                            disabled={isResending || isLoading}
                        >
                            {isResending ? "Resending..." : "Resend code"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}

interface LoginFormProps extends React.ComponentProps<"div"> {
    onSuccess?: () => void;
}

export function LoginForm({ className, onSuccess, ...props }: LoginFormProps) {
    const { loginStep1, loginComplete, isLoading } = useAuthContext();
    const router = useRouter();

    const [state, setState] = React.useState<LoginState>({
        step: STEP_CREDENTIALS,
        email: "",
        password: "",
        isResending: false,
        showForgotPassword: false,
        isGoogleLoading: false,
        showEmailVerification: false,
    });

    const handleCredentialsSubmit = async (values: LoginCredentialsValues) => {
        try {
            const response = await loginStep1(values);

            if (response.requiresTwoFa) {
                setState(prev => ({
                    ...prev,
                    step: STEP_TWO_FA,
                    email: response.email,
                    password: values.password,
                }));
            } else {
                router.push("/");
            }
        } catch (error: any) {
            const errorMessage = error?.message || error?.response?.data?.message || error?.msg || "";
            const isUnverifiedEmail = error?.status === 401 &&
                                    (errorMessage.toLowerCase().includes("email not verified") ||
                                     errorMessage.toLowerCase().includes("verify your email"));

            if (isUnverifiedEmail) {
                setState(prev => ({
                    ...prev,
                    email: values.email,
                    password: values.password,
                    showEmailVerification: true,
                }));
            } else {
                throw error;
            }
        }
    };

    const handleTwoFaSubmit = async (values: TwoFaValues) => {
        try {
            await loginComplete({
                email: state.email,
                code: values.code,
            });
            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/");
            }
        } catch (error: any) {
            throw error;
        }
    };

    const handleResendCode = async () => {
        setState(prev => ({ ...prev, isResending: true }));

        try {
            await loginStep1({
                email: state.email,
                password: state.password,
            });
        } catch (error) {
            // Handle error if needed
        } finally {
            setState(prev => ({ ...prev, isResending: false }));
        }
    };

    const handleBack = () => {
        setState(prev => ({ ...prev, step: STEP_CREDENTIALS }));
    };

    const handleForgotPassword = () => {
        setState(prev => ({ ...prev, showForgotPassword: true }));
    };

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

    const stepTitle = state.step === STEP_TWO_FA
        ? "Two-factor authentication"
        : "Sign in to your account";

    const stepDescription = state.step === STEP_TWO_FA
        ? "Enter the verification code sent to your email"
        : "Welcome back! Please sign in to continue";

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>{stepTitle}</CardTitle>
                    <CardDescription>{stepDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    {state.step === STEP_CREDENTIALS ? (
                        <CredentialsStep
                            onSubmit={handleCredentialsSubmit}
                            onForgotPassword={handleForgotPassword}
                            onGoogleLogin={handleGoogleLogin}
                            isLoading={isLoading}
                            isGoogleLoading={state.isGoogleLoading}
                        />
                    ) : (
                        <TwoFactorStep
                            email={state.email}
                            onSubmit={handleTwoFaSubmit}
                            onResendCode={handleResendCode}
                            onBack={handleBack}
                            isLoading={isLoading}
                            isResending={state.isResending}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}