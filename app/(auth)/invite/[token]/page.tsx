"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invite, setInvite] = useState<{ name: string; email: string } | null>(null);
  const [inviteStatus, setInviteStatus] = useState<"pending" | "accepted" | "invalid" | null>(null);
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/invitations/token/${token}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          setInviteStatus("invalid");
        } else if (data.invitation.acceptedAt) {
          setInviteStatus("accepted");
        } else {
          setInvite({ name: data.invitation.name, email: data.invitation.email });
          setInviteStatus("pending");
        }
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
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
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-semibold">Accept Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            {inviteStatus === "invalid" && (
              <div className="text-center text-red-600 font-medium">Invalid or expired invitation link.</div>
            )}
            {inviteStatus === "accepted" && (
              <div className="text-center text-green-600 font-medium">This invitation has already been accepted.</div>
            )}
            {inviteStatus === "pending" && invite && !success && (
              <>
                <div className="mb-4 text-center">
                  <div className="font-medium text-lg">{invite.email}</div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Accepting..." : "Accept Invitation"}
                  </Button>
                </form>
              </>
            )}
            {success && (
              <div className="text-center text-green-600 font-medium">Invitation accepted! Redirecting to login...</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 