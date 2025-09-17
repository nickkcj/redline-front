"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthContext } from "@/contexts/auth-context";

const nameSchema = z.string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-ZÀ-ÿĀ-žА-я\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

const emailSchema = z.string()
  .email("Please enter a valid email address")
  .transform(val => val.toLowerCase().trim());

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirm: passwordSchema,
}).refine((data) => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});

const verifyEmailSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type RegisterData = z.infer<typeof registerSchema>;
type VerifyEmailData = z.infer<typeof verifyEmailSchema>;
type RegisterStep = 'register' | 'verify-email' | 'completed';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [step, setStep] = useState<RegisterStep>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegisterData | null>(null);
  const [isResending, setIsResending] = useState(false);

  const { registerStep1, registerConfirm, isLoading, error, clearError } = useAuthContext();

  // Step 1 form
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm: "",
    },
  });

  // Step 2 form
  const verifyForm = useForm<VerifyEmailData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleRegisterSubmit = async (data: RegisterData) => {
    try {
      clearError();
      const response = await registerStep1({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      setRegistrationData(data);
      setStep('verify-email');
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration step 1 failed:', error);
    }
  };

  const handleVerifySubmit = async (data: VerifyEmailData) => {
    if (!registrationData) return;

    try {
      clearError();
      await registerConfirm({
        email: registrationData.email,
        code: data.code,
      });

      setStep('completed');
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration verification failed:', error);
    }
  };

  const handleResendCode = async () => {
    if (!registrationData) return;

    try {
      setIsResending(true);
      clearError();
      await registerStep1({
        name: registrationData.name,
        email: registrationData.email,
        password: registrationData.password,
      });
    } catch (error) {
      console.error('Resend code failed:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToRegister = () => {
    setStep('register');
    setRegistrationData(null);
    verifyForm.reset();
    clearError();
  };

  const handleCompletedLogin = () => {
    onSuccess?.();
  };

  const getErrorActions = () => {
    if (!error) return null;

    // Check if error is about existing email
    if (error.includes('already exists') || error.includes('already registered')) {
      return (
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLoginClick}
          >
            Go to Login
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => clearError()}
          >
            Try Again
          </Button>
        </div>
      );
    }

    return null;
  };

  if (step === 'register') {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Get started with your free account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="flex flex-col gap-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Registration Error</p>
                    <p className="text-sm mt-1">{error}</p>
                    {getErrorActions()}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-3">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm leading-none font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="h-9"
                {...registerForm.register("name")}
              />
              <div className="h-4">
                {registerForm.formState.errors.name && (
                  <p className="text-xs text-red-600">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm leading-none font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="h-9"
                {...registerForm.register("email")}
              />
              <div className="h-4">
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-red-600">
                    {registerForm.formState.errors.email.message}
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
                  placeholder="Create a password"
                  className="h-9 pr-10"
                  {...registerForm.register("password")}
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
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-red-600">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="confirm" className="flex items-center gap-2 text-sm leading-none font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="h-9 pr-10"
                  {...registerForm.register("confirm")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="h-4">
                {registerForm.formState.errors.confirm && (
                  <p className="text-xs text-red-600">
                    {registerForm.formState.errors.confirm.message}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full h-9" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="text-sm p-0 h-auto underline underline-offset-4"
                  onClick={onLoginClick}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify-email') {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We've sent a verification code to {registrationData?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={verifyForm.handleSubmit(handleVerifySubmit)} className="flex flex-col gap-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Verification Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-3">
              <Label htmlFor="code" className="flex items-center gap-2 text-sm leading-none font-medium">
                Verification Code
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                className="h-9 text-center tracking-widest"
                maxLength={6}
                {...verifyForm.register("code")}
              />
              <div className="h-4">
                {verifyForm.formState.errors.code && (
                  <p className="text-xs text-red-600">
                    {verifyForm.formState.errors.code.message}
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
                "Verify & Create Account"
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-9"
                onClick={handleBackToRegister}
              >
                Back to Register
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-9"
                disabled={isResending}
                onClick={handleResendCode}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Completed step
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle>Account created successfully!</CardTitle>
        <CardDescription>
          Welcome to Vaultly! Your account has been verified and is ready to use.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleCompletedLogin} className="w-full h-9">
          Continue to Login
        </Button>
      </CardContent>
    </Card>
  );
}