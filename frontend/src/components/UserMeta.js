import { CodeIcon } from "@/components/Icons";

// Name line + about + skills, shared by request and connection cards
export default function UserMeta({ user, aboutLines = "line-clamp-2" }) {
  const details = [user.age, user.gender].filter(Boolean).join(" · ");
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate font-display text-base font-semibold text-ink">
        {user.firstName} {user.lastName}
      </p>
      {details && <p className="text-xs capitalize text-subtle">{details}</p>}
      {user.about && <p className={`mt-2 text-sm text-muted ${aboutLines}`}>{user.about}</p>}
      {user.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {user.skills.slice(0, 5).map((skill) => (
            <span key={skill} className="chip">
              <CodeIcon className="size-3 text-crimson-300" />
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
