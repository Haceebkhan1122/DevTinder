"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { ArrowLeftIcon, MailIcon } from "@/components/Icons";
import { Spinner } from "@/components/Spinner";
import AuthCard from "@/components/auth/AuthCard";

export default function ForgotPasswordForm() {
  const toast = useToast();
  const [emailId, setEmailId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentMessage, setSentMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.forgotPassword(emailId.trim().toLowerCase());
      setSentMessage(res?.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const backToLogin = (
    <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-crimson-300 hover:text-crimson-400">
      <ArrowLeftIcon className="size-4" /> Back to login
    </Link>
  );

  if (sentMessage) {
    return (
      <AuthCard title="Check your inbox" footer={backToLogin}>
        <div className="flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-crimson-800/40 text-crimson-300 ring-1 ring-crimson-700/50">
            <MailIcon className="size-8" />
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted">{sentMessage}</p>
          <p className="mt-3 text-xs text-subtle">The link is valid for 15 minutes and works only once.</p>
          <button onClick={() => setSentMessage("")} className="btn btn-ghost mt-6">
            Use a different email
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={backToLogin}
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
        <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3">
          {submitting && <Spinner className="size-4" />}
          Send reset link
        </button>
      </form>
    </AuthCard>
  );
}
