"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import Avatar from "@/components/Avatar";
import UserMeta from "@/components/UserMeta";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { PageLoader } from "@/components/Spinner";
import { MessageIcon, UsersIcon } from "@/components/Icons";

export default function ConnectionsGrid() {
  const toast = useToast();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .getConnections()
      .then((list) => setConnections(list.filter(Boolean)))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? connections.filter((c) =>
        [c.firstName, c.lastName, ...(c.skills || [])].join(" ").toLowerCase().includes(q)
      )
    : connections;

  if (loading) return <PageLoader label="Loading your connections..." />;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Connections"
        subtitle={connections.length ? `You're connected with ${connections.length} ${connections.length === 1 ? "developer" : "developers"}` : "Your matches live here"}
      >
        {connections.length > 0 && (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or skill..."
            className="input sm:w-72"
          />
        )}
      </PageHeader>

      {connections.length === 0 ? (
        <div className="mx-auto max-w-md">
          <EmptyState
            icon={UsersIcon}
            title="No connections yet"
            description="Swipe right on developers you like. When they accept, you'll see them here."
            action={<Link href="/feed" className="btn btn-primary">Start discovering</Link>}
          />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">No connections match &quot;{query}&quot;.</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => (
            <li key={user._id} className="card flex animate-fade-up flex-col p-5 transition hover:border-navy-500">
              <div className="flex gap-4">
                <Avatar user={user} className="size-14" textClassName="text-base" />
                <UserMeta user={user} aboutLines="line-clamp-3" />
              </div>
              <button
                disabled
                className="btn btn-secondary mt-5 w-full"
                title="Chat is coming soon"
              >
                <MessageIcon className="size-4" /> Message · soon
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
