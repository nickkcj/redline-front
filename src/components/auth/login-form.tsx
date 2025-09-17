"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthContext } from "@/contexts/auth-context";

const loginStep1Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginCompleteSchema = z.object({
  twoFaCode: z.string().length(6, "Verification code must be 6 digits"),
});

type LoginStep1Data = z.infer<typeof loginStep1Schema>;
type LoginCompleteData = z.infer<typeof loginCompleteSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [step, setStep] = useState<'credentials' | 'twofa'>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [credentialsData, setCredentialsData] = useState<LoginStep1Data | null>(null);

  const { loginStep1, loginComplete, isLoading, error, clearError } = useAuthContext();

  // Step 1 form
  const step1Form = useForm<LoginStep1Data>({
    resolver: zodResolver(loginStep1Schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Step 2 form
  const step2Form = useForm<LoginCompleteData>({
    resolver: zodResolver(loginCompleteSchema),
    defaultValues: {
      twoFaCode: "",
    },
  });

  const handleStep1Submit = async (data: LoginStep1Data) => {
    try {
      clearError();
      const response = await loginStep1(data);

      if (response.requiresTwoFa) {
        setCredentialsData(data);
        setStep('twofa');
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login step 1 failed:', error);
    }
  };

  const handleStep2Submit = async (data: LoginCompleteData) => {
    if (!credentialsData) return;

    try {
      clearError();
      await loginComplete({
        ...credentialsData,
        twoFaCode: data.twoFaCode,
      });

      onSuccess?.();
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login step 2 failed:', error);
    }
  };

  const handleBackToStep1 = () => {
    setStep('credentials');
    setCredentialsData(null);
    step2Form.reset();
    clearError();
  };

  if (step === 'credentials') {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="flex flex-col gap-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-3">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm leading-none font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="h-9"
                {...step1Form.register("email")}
              />
              <div className="h-4">
                {step1Form.formState.errors.email && (
                  <p className="text-xs text-red-600">
                    {step1Form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm leading-none font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-9 pr-10"
                  {...step1Form.register("password")}
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
                {step1Form.formState.errors.password && (
                  <p className="text-xs text-red-600">
                    {step1Form.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full h-9" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="text-center">
              <Button variant="link" className="text-sm text-muted-foreground hover:text-foreground transition-colors p-0 h-auto underline underline-offset-4">
                Forgot your password?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Two-factor authentication</CardTitle>
        <CardDescription>
          We've sent a verification code to {credentialsData?.email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="flex flex-col gap-6">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-3">
            <Label htmlFor="twoFaCode" className="flex items-center gap-2 text-sm leading-none font-medium">
              Verification Code
            </Label>
            <Input
              id="twoFaCode"
              type="text"
              placeholder="Enter 6-digit code"
              className="h-9 text-center tracking-widest"
              maxLength={6}
              {...step2Form.register("twoFaCode")}
            />
            <div className="h-4">
              {step2Form.formState.errors.twoFaCode && (
                <p className="text-xs text-red-600">
                  {step2Form.formState.errors.twoFaCode.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full h-9" disabled={isLoading}>
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
              className="flex-1 h-9"
              onClick={handleBackToStep1}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-9"
            >
              Resend code
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}