"use client";

import { useState } from "react";
import { cn, hasRealPhoto, initials } from "@/lib/utils";

// Profile photo with a gradient-initials fallback when the image is missing or broken
export default function Avatar({ user, className = "size-10", textClassName = "text-sm" }) {
  const [broken, setBroken] = useState(false);
  const showImage = hasRealPhoto(user) && !broken;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-linear-to-br from-navy-500 to-crimson-700 ring-2 ring-navy-700",
        className
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- user photos come from any domain
        <img
          src={user.photoUrl}
          alt={user.firstName || "User"}
          className="size-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className={cn("flex size-full items-center justify-center font-semibold text-white", textClassName)}>
          {initials(user)}
        </span>
      )}
    </div>
  );
}
