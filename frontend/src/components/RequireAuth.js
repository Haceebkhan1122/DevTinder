"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/Spinner";

// Wrap pages that need a logged-in user
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <PageLoader />;
  }
  return children;
}

// Wrap login/signup pages: users who were ALREADY logged in when the page opened go to the feed.
// The decision is made once, so logging in on this page doesn't race with the form's own redirect
// (e.g. signup sends the new user to /profile, not /feed).
export function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [decision, setDecision] = useState(null); // null | "guest" | "user"

  // Decide once, right after the first auth check finishes (state update during render is allowed here)
  if (!loading && decision === null) {
    setDecision(user ? "user" : "guest");
  }

  useEffect(() => {
    if (decision === "user") {
      router.replace("/feed");
    }
  }, [decision, router]);

  if (decision !== "guest") {
    return <PageLoader />;
  }
  return children;
}
