"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: resetError } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (resetError) {
        setError(resetError.message || "Failed to send reset email");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>
        {success ? (
          <CardContent className="space-y-4">
            <div className="p-3 text-sm text-green-700 bg-green-100/50 rounded-md">
              A password reset link has been sent to your email. (Check the terminal logs for the mock email link).
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Return to login</Link>
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleReset}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-100/50 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending link..." : "Send reset link"}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">Back to log in</Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
