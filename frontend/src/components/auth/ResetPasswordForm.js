"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { isStrongPassword } from "@/lib/password";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { AlertIcon, CheckIcon } from "@/components/Icons";
import { PasswordChecklist, PasswordInput } from "@/components/PasswordInput";
import { Spinner } from "@/components/Spinner";
import AuthCard from "@/components/auth/AuthCard";

export default function ResetPasswordForm() {
  const { token } = useParams();
  const { setUser } = useAuth();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("form"); // form | success | invalid

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStrongPassword(password)) {
      return toast.error("Please enter a strong password!");
    }
    if (password !== confirm) {
      return toast.error("Passwords do not match!");
    }

    setSubmitting(true);
    try {
      await api.resetPassword(token, password);
      // Backend logged out every old session (and cleared this browser's cookie)
      setUser(null);
      setStatus("success");
    } catch (err) {
      if (err.status === 400 && err.message.toLowerCase().includes("reset link")) {
        setStatus("invalid");
      } else {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "success") {
    return (
      <AuthCard title="Password updated">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-success/15 text-success ring-1 ring-success/40">
            <CheckIcon className="size-8" />
          </div>
          <p className="mt-5 text-sm text-muted">
            Your password has been reset and all old sessions were logged out. Log in with your new password.
          </p>
          <Link href="/login" className="btn btn-primary mt-6 w-full py-3">Go to login</Link>
        </div>
      </AuthCard>
    );
  }

  if (status === "invalid") {
    return (
      <AuthCard title="Link expired">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-crimson-800/40 text-crimson-300 ring-1 ring-crimson-700/50">
            <AlertIcon className="size-8" />
          </div>
          <p className="mt-5 text-sm text-muted">
            This reset link is invalid, has expired or was already used. Reset links work once and only for 15 minutes.
          </p>
          <Link href="/forgot-password" className="btn btn-primary mt-6 w-full py-3">Request a new link</Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a strong password you haven't used before">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <PasswordInput id="password" label="New password" value={password} onChange={setPassword} autoComplete="new-password" />
          <PasswordChecklist password={password} />
        </div>
        <div>
          <PasswordInput id="confirm" label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          {confirm && confirm !== password && <p className="mt-1.5 text-xs text-crimson-300">Passwords do not match</p>}
        </div>
        <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3">
          {submitting && <Spinner className="size-4" />}
          Reset password
        </button>
      </form>
    </AuthCard>
  );
}
