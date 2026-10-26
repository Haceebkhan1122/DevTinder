"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isStrongPassword } from "@/lib/password";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { GuestOnly } from "@/components/RequireAuth";
import { PasswordChecklist, PasswordInput } from "@/components/PasswordInput";
import { Spinner } from "@/components/Spinner";
import AuthCard from "@/components/auth/AuthCard";

export default function SignupForm() {
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", emailId: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.firstName.trim().length < 3) {
      return toast.error("First name must be at least 3 characters!");
    }
    if (!isStrongPassword(form.password)) {
      return toast.error("Please enter a strong password!");
    }

    setSubmitting(true);
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      emailId: form.emailId.trim().toLowerCase(),
      password: form.password,
    };
    try {
      await api.signup(payload);
      // Signup doesn't log in on the backend, so log in right away with the same credentials
      await login({ emailId: payload.emailId, password: payload.password });
      toast.success("Account created! Complete your profile so others can find you.");
      router.replace("/profile");
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  return (
    <GuestOnly>
      <AuthCard
        title="Create your account"
        subtitle="Join developers who build together"
        footer={
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-crimson-300 hover:text-crimson-400">
              Log in
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="label">First name</label>
              <input id="firstName" value={form.firstName} onChange={update("firstName")} autoComplete="given-name" className="input" placeholder="Ali" required />
            </div>
            <div>
              <label htmlFor="lastName" className="label">Last name</label>
              <input id="lastName" value={form.lastName} onChange={update("lastName")} autoComplete="family-name" className="input" placeholder="Khan" required />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" value={form.emailId} onChange={update("emailId")} autoComplete="email" className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <PasswordInput
              id="password"
              label="Password"
              value={form.password}
              onChange={(password) => setForm((f) => ({ ...f, password }))}
              autoComplete="new-password"
            />
            <PasswordChecklist password={form.password} />
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3">
            {submitting && <Spinner className="size-4" />}
            Create account
          </button>
        </form>
      </AuthCard>
    </GuestOnly>
  );
}
