"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import Avatar from "@/components/Avatar";
import UserMeta from "@/components/UserMeta";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { PageLoader, Spinner } from "@/components/Spinner";
import { CheckIcon, CloseIcon, InboxIcon } from "@/components/Icons";

export default function RequestsList() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({}); // requestId -> "accepted" | "rejected"

  useEffect(() => {
    api
      .getReceivedRequests()
      // fromUserId is null if the sender deleted their account
      .then((list) => setRequests(list.filter((r) => r.fromUserId)))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const review = async (request, status) => {
    setBusy((b) => ({ ...b, [request._id]: status }));
    try {
      await api.reviewRequest(status, request._id);
      setRequests((list) => list.filter((r) => r._id !== request._id));
      window.dispatchEvent(new CustomEvent("requests:changed"));
      if (status === "accepted") {
        toast.success(`You're now connected with ${request.fromUserId.firstName}!`);
      } else {
        toast.info(`Request from ${request.fromUserId.firstName} declined.`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy((b) => {
        const next = { ...b };
        delete next[request._id];
        return next;
      });
    }
  };

  if (loading) return <PageLoader label="Loading your requests..." />;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Requests"
        subtitle={
          requests.length
            ? `${requests.length} ${requests.length === 1 ? "developer wants" : "developers want"} to connect with you`
            : "People who are interested in you show up here"
        }
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title="No pending requests"
          description="When someone swipes right on you, their request will appear here."
          action={<Link href="/feed" className="btn btn-primary">Discover developers</Link>}
        />
      ) : (
        <ul className="space-y-4">
          {requests.map((request) => {
            const sender = request.fromUserId;
            const state = busy[request._id];
            return (
              <li key={request._id} className="card flex animate-fade-up flex-col gap-4 p-5 sm:flex-row sm:items-start">
                <div className="flex flex-1 gap-4">
                  <Avatar user={sender} className="size-16" textClassName="text-lg" />
                  <div className="min-w-0 flex-1">
                    <UserMeta user={sender} />
                    <p className="mt-3 text-xs text-subtle">Sent {timeAgo(request.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <button
                    onClick={() => review(request, "accepted")}
                    disabled={!!state}
                    className="btn btn-primary flex-1 sm:w-32"
                  >
                    {state === "accepted" ? <Spinner className="size-4" /> : <CheckIcon className="size-4" />}
                    Accept
                  </button>
                  <button
                    onClick={() => review(request, "rejected")}
                    disabled={!!state}
                    className="btn btn-secondary flex-1 sm:w-32"
                  >
                    {state === "rejected" ? <Spinner className="size-4" /> : <CloseIcon className="size-4" />}
                    Decline
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
