"use client";

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Building2, Eye, EyeOff, CircleCheckBig } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      {children}
    </Suspense>
  );
}

export default function AcceptInvitePageWrapper() {
  return (
    <SuspenseWrapper>
      <AcceptInvitePage />
    </SuspenseWrapper>
  );
}

function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [invite, setInvite] = useState<{ name: string; email: string } | null>(
    null
  );
  const [inviteStatus, setInviteStatus] = useState<
    "pending" | "accepted" | "invalid" | null
  >(null);
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/invitations/token/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setInviteStatus("invalid");
        } else if (data.invitation.acceptedAt) {
          setInviteStatus("accepted");
        } else {
          setInvite({
            name: data.invitation.name,
            email: data.invitation.email,
          });
          setInviteStatus("pending");
        }
      });
  }, [token]);

  const validatePassword = (password: string) => {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
      password
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      // Automatically log the user in
      try {
        const loginResult = await authClient.signIn.email({
          email: invite?.email || "",
          password,
        });
        if (loginResult?.error) {
          toast.error(
            "Account created, but automatic login failed. Please log in manually."
          );
          setSuccess(true);
          setTimeout(() => router.push("/login"), 2000);
        } else {
          toast.success("Invitation accepted! Logging you in...");
          setSuccess(true);
          setTimeout(() => router.push("/dashboard"), 1500);
        }
      } catch {
        toast.error(
          "Account created, but automatic login failed. Please log in manually."
        );
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Brand */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">RentManager</h1>
          <p className="mt-2 text-muted-foreground">
            Property Management System
          </p>
        </div>
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-semibold">
              Accept Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inviteStatus === "invalid" && (
              <div className="text-center text-red-600 font-medium">
                Invalid or expired invitation link.
              </div>
            )}
            {inviteStatus === "accepted" && (
              <div className="text-center text-green-600 font-medium">
                This invitation has already been accepted.
              </div>
            )}
            {inviteStatus === "pending" && invite && !success && (
              <>
                <div className="mb-4 text-center">
                  <div className="font-medium text-lg">{invite.email}</div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-foreground"
                    >
                      Password
                    </Label>

                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 pr-10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-foreground"
                    >
                      Confirm Password
                    </Label>

                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-11 pr-10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-50 text-sm p-4">
                      <p className="text-red-500">{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Accepting..." : "Accept Invitation"}
                  </Button>
                </form>
              </>
            )}
            {success && (
              <div className="text-center text-green-600 font-medium space-y-4">
                <div className="p-6 bg-green-50 rounded-full flex items-center justify-center">
                  <CircleCheckBig className="text-green-600 size-6 md:size-8 lg:size-12" />
                </div>
                <p>Invitation accepted! Redirecting...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
