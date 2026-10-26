"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { GuestOnly } from "@/components/RequireAuth";
import { PasswordInput } from "@/components/PasswordInput";
import { Spinner } from "@/components/Spinner";
import AuthCard from "@/components/auth/AuthCard";

export default function LoginForm() {
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login({ emailId: emailId.trim(), password });
      toast.success(`Welcome back, ${user?.firstName || "dev"}!`);
      router.replace("/feed");
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  return (
    <GuestOnly>
      <AuthCard
        title="Welcome back"
        subtitle="Log in to continue swiping"
        footer={
          <>
            New to devTinder?{" "}
            <Link href="/signup" className="font-semibold text-crimson-300 hover:text-crimson-400">
              Create an account
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="input"
              required
            />
          </div>
          <PasswordInput id="password" label="Password" value={password} onChange={setPassword} />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-muted hover:text-crimson-300">
              Forgot password?
            </Link>
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3">
            {submitting && <Spinner className="size-4" />}
            Log in
          </button>
        </form>
      </AuthCard>
    </GuestOnly>
  );
}
