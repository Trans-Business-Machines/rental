"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");

  // Password strength indicator
  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    try {
      await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(
        "Failed to reset password. The link may have expired. Please request a new one."
      );
    }
  };

  // Invalid/Missing Token State
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request
              a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => router.push("/forgot-password")}
            >
              Request New Link
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">
              Password Reset Successful
            </CardTitle>
            <CardDescription>
              Your password has been reset successfully. You can now log in with
              your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form State
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below. Make sure it&apos;s secure and
            memorable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={cn(errors.password && "border-red-400", "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          i < passwordStrength
                            ? strengthColors[passwordStrength - 1]
                            : "bg-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Strength:{" "}
                    {passwordStrength > 0
                      ? strengthLabels[passwordStrength - 1]
                      : "Enter a password"}
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={cn(
                    errors.confirmPassword && "border-red-400",
                    "pr-10"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 font-medium mb-2">
                Password requirements:
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li
                  className={cn(
                    password.length >= 8 && "text-green-600 font-medium"
                  )}
                >
                  • At least 8 characters
                </li>
                <li
                  className={cn(
                    /[A-Z]/.test(password) && "text-green-600 font-medium"
                  )}
                >
                  • One uppercase letter
                </li>
                <li
                  className={cn(
                    /[a-z]/.test(password) && "text-green-600 font-medium"
                  )}
                >
                  • One lowercase letter
                </li>
                <li
                  className={cn(
                    /[0-9]/.test(password) && "text-green-600 font-medium"
                  )}
                >
                  • One number
                </li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading fallback for Suspense
function ResetPasswordLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main export with Suspense wrapper (required for useSearchParams)
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
