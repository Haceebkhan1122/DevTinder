"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ArrowRightIcon } from "@/components/Icons";

export default function HeroActions() {
  const { user, loading } = useAuth();

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {!loading && user ? (
        <Link href="/feed" className="btn btn-primary px-6 py-3 text-base">
          Continue to your feed <ArrowRightIcon className="size-4" />
        </Link>
      ) : (
        <>
          <Link href="/signup" className="btn btn-primary px-6 py-3 text-base">
            Create free account <ArrowRightIcon className="size-4" />
          </Link>
          <Link href="/login" className="btn btn-secondary px-6 py-3 text-base">
            I already have one
          </Link>
        </>
      )}
    </div>
  );
}
