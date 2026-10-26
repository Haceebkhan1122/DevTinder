"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import Avatar from "@/components/Avatar";
import { CardsIcon, InboxIcon, LogoMark, LogoutIcon, UserIcon, UsersIcon } from "@/components/Icons";

const LINKS = [
  { href: "/feed", label: "Discover", icon: CardsIcon },
  { href: "/requests", label: "Requests", icon: InboxIcon },
  { href: "/connections", label: "Connections", icon: UsersIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  // Badge with the number of pending requests.
  // Loaded once per logged-in user (not on every page change), then refreshed only when it can change:
  // after accepting/declining a request, or when the user comes back to this browser tab.
  const userId = user?._id;
  useEffect(() => {
    if (!userId) return;
    const load = () =>
      api
        .getReceivedRequests()
        .then((list) => setPendingCount(list.length))
        .catch(() => {});
    load();
    window.addEventListener("requests:changed", load);
    window.addEventListener("focus", load);
    return () => {
      window.removeEventListener("requests:changed", load);
      window.removeEventListener("focus", load);
    };
  }, [userId]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out. See you soon!");
    } catch (err) {
      toast.error(err.message);
    }
    router.replace("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-navy-950/75 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={user ? "/feed" : "/"} className="flex items-center gap-2.5">
            <LogoMark className="size-8" />
            <span className="font-display text-lg font-bold tracking-tight">
              dev<span className="text-crimson-400">Tinder</span>
            </span>
          </Link>

          {user ? (
            <>
              <div className="hidden items-center gap-1 md:flex">
                {LINKS.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                        active ? "bg-navy-800 text-ink" : "text-muted hover:bg-navy-850 hover:text-ink"
                      )}
                    >
                      <Icon className={cn("size-4", active && "text-crimson-400")} />
                      {label}
                      {href === "/requests" && pendingCount > 0 && (
                        <span className="rounded-full bg-crimson-500 px-1.5 text-[11px] font-bold leading-5 text-white">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <Link href="/profile" className="hidden items-center gap-2 sm:flex">
                  <span className="text-sm text-muted">
                    Hi, <span className="font-semibold text-ink">{user.firstName}</span>
                  </span>
                  <Avatar user={user} className="size-9" textClassName="text-xs" />
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost px-2.5" aria-label="Log out" title="Log out">
                  <LogoutIcon className="size-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-ghost">Log in</Link>
              <Link href="/signup" className="btn btn-primary">Sign up</Link>
            </div>
          )}
        </nav>
      </header>

      {/* Mobile bottom tab bar */}
      {user && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-navy-950/90 backdrop-blur-xl md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-4">
            {LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                    active ? "text-crimson-300" : "text-subtle"
                  )}
                >
                  <Icon className="size-5" />
                  {label}
                  {href === "/requests" && pendingCount > 0 && (
                    <span className="absolute top-1.5 left-1/2 ml-2 rounded-full bg-crimson-500 px-1.5 text-[10px] font-bold leading-4 text-white">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
