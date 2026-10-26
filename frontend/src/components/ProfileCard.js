"use client";

import { useState } from "react";
import { hasRealPhoto, initials } from "@/lib/utils";
import { CodeIcon } from "@/components/Icons";

// Big portrait card used in the feed deck and the profile preview
export default function ProfileCard({ user, badge }) {
  const [broken, setBroken] = useState(false);
  const showImage = hasRealPhoto(user) && !broken;
  const skills = user?.skills || [];

  return (
    <article className="relative flex size-full select-none flex-col overflow-hidden rounded-3xl border border-line bg-navy-900 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.85)]">
      <div className="relative min-h-0 flex-1 overflow-hidden bg-linear-to-br from-navy-600 via-navy-800 to-crimson-800">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- user photos come from any domain
          <img
            src={user.photoUrl}
            alt={user.firstName}
            draggable={false}
            className="size-full object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center font-display text-7xl font-bold text-white/85">
            {initials(user)}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-navy-950 via-navy-950/60 to-transparent" />
        {badge}

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="font-display text-2xl font-bold text-white drop-shadow">
            {user?.firstName} {user?.lastName}
            {user?.age ? <span className="ml-2 font-sans text-xl font-medium text-white/80">{user.age}</span> : null}
          </h2>
          {user?.gender && <p className="mt-0.5 text-sm capitalize text-white/70">{user.gender}</p>}
        </div>
      </div>

      <div className="space-y-3 p-5">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{user?.about}</p>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 6).map((skill) => (
              <span key={skill} className="chip">
                <CodeIcon className="size-3 text-crimson-300" />
                {skill}
              </span>
            ))}
            {skills.length > 6 && <span className="chip text-muted">+{skills.length - 6}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
