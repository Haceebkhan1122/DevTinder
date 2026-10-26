"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import ProfileCard from "@/components/ProfileCard";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { PageLoader, Spinner } from "@/components/Spinner";
import { CloseIcon, HeartIcon, RefreshIcon, SparklesIcon } from "@/components/Icons";
import SwipeCard from "@/components/feed/SwipeCard";

const BATCH_SIZE = 10;

export default function FeedDeck() {
  const toast = useToast();
  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [exit, setExit] = useState(null); // { id, dir } of the card currently flying out
  const seenIds = useRef(new Set()); // users we already swiped in this session
  const deckIds = useRef(new Set()); // users currently in the deck

  useEffect(() => {
    deckIds.current = new Set(deck.map((u) => u._id));
  }, [deck]);

  // The backend removes everyone we already sent a request to from the feed,
  // so "page 1" always holds fresh people. We just skip ones already in the deck or swiped.
  const appendFresh = useCallback((users) => {
    const fresh = users.filter((u) => !deckIds.current.has(u._id) && !seenIds.current.has(u._id));
    if (fresh.length === 0) {
      setExhausted(true);
      return;
    }
    setDeck((current) => [...current, ...fresh.filter((u) => !current.some((c) => c._id === u._id))]);
  }, []);

  // First load when the page opens
  useEffect(() => {
    api
      .getFeed({ page: 1, limit: BATCH_SIZE })
      .then(appendFresh)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [appendFresh, toast]);

  // Later loads (called from event handlers)
  const loadMore = async () => {
    setFetchingMore(true);
    try {
      appendFresh(await api.getFeed({ page: 1, limit: BATCH_SIZE }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFetchingMore(false);
    }
  };

  const top = deck[0];

  const decide = useCallback(
    (dir) => {
      if (!top || exit) return;
      setExit({ id: top._id, dir });
    },
    [top, exit]
  );

  // Called when the card animation finished: remove it, refill the deck if needed, call the API
  const handleExited = async () => {
    if (!exit) return;
    const user = deck.find((u) => u._id === exit.id);
    const status = exit.dir === "right" ? "interested" : "ignore";
    seenIds.current.add(exit.id);
    setDeck((current) => current.filter((u) => u._id !== exit.id));
    setExit(null);

    // Refill before the deck runs out
    if (deck.length - 1 <= 2 && !exhausted && !fetchingMore) {
      loadMore();
    }

    try {
      await api.sendRequest(status, exit.id);
      if (status === "interested") {
        toast.success(`Connection request sent to ${user?.firstName}!`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Keyboard: ← pass, → connect
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea")) return;
      if (e.key === "ArrowRight") decide("right");
      if (e.key === "ArrowLeft") decide("left");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide]);

  const refresh = async () => {
    setExhausted(false);
    setLoading(true);
    await loadMore();
    setLoading(false);
  };

  if (loading) {
    return <PageLoader label="Finding developers for you..." />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title="Discover" subtitle="Swipe right to connect, left to pass. Keyboard: ← →" />

      {!top ? (
        <div className="mx-auto max-w-md">
          <EmptyState
            icon={SparklesIcon}
            title="You've seen everyone for now"
            description="New developers join every day. Check back later or refresh to look again."
            action={
              <button onClick={refresh} className="btn btn-secondary">
                <RefreshIcon className="size-4" /> Refresh feed
              </button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative h-[calc(100dvh-22rem)] max-h-[36rem] min-h-[21rem] w-full max-w-sm">
            {/* Cards waiting behind the top one */}
            {deck.slice(1, 3).map((user, i) => (
              <div
                key={user._id}
                className="pointer-events-none absolute inset-0 transition-transform duration-300"
                style={{
                  transform: `translateY(${(i + 1) * 14}px) scale(${1 - (i + 1) * 0.05})`,
                  zIndex: 10 - i,
                  opacity: 1 - (i + 1) * 0.25,
                }}
              >
                <ProfileCard user={user} />
              </div>
            )).reverse()}

            <SwipeCard
              key={top._id}
              user={top}
              exitDir={exit?.id === top._id ? exit.dir : null}
              onDecide={decide}
              onExited={handleExited}
            />
          </div>

          <div className="mt-8 flex items-center gap-6 sm:mt-10">
            <button
              onClick={() => decide("left")}
              disabled={!!exit}
              className="flex size-16 cursor-pointer items-center justify-center rounded-full border border-line bg-navy-850 text-muted shadow-xl transition hover:scale-105 hover:border-crimson-500 hover:text-crimson-300 disabled:opacity-50"
              aria-label="Pass"
              title="Pass (←)"
            >
              <CloseIcon className="size-7" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => decide("right")}
              disabled={!!exit}
              className="flex size-20 cursor-pointer items-center justify-center rounded-full bg-linear-to-br from-crimson-500 to-crimson-700 text-white shadow-xl shadow-crimson-800/50 transition hover:scale-105 disabled:opacity-50"
              aria-label="Connect"
              title="Connect (→)"
            >
              <HeartIcon className="size-8" />
            </button>
          </div>

          <p className="mt-5 flex items-center gap-2 text-xs text-subtle">
            {fetchingMore && <Spinner className="size-3" />}
            {deck.length} {deck.length === 1 ? "developer" : "developers"} in your deck
          </p>
        </div>
      )}
    </div>
  );
}
