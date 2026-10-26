"use client";

import { useEffect, useRef, useState } from "react";
import ProfileCard from "@/components/ProfileCard";

const SWIPE_THRESHOLD = 110; // px the card must travel to count as a swipe
const EXIT_MS = 280;

// Draggable top card. Drag right = interested, left = ignore.
// `exitDir` lets the parent (buttons / keyboard) throw the card out too.
export default function SwipeCard({ user, exitDir, onDecide, onExited }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const start = useRef(null);

  // Latest onExited in a ref, so a parent re-render doesn't restart the exit timer
  const onExitedRef = useRef(onExited);
  useEffect(() => {
    onExitedRef.current = onExited;
  }, [onExited]);

  // When a decision is made, wait for the fly-out animation, then tell the parent
  useEffect(() => {
    if (!exitDir) return;
    const timer = setTimeout(() => onExitedRef.current(), EXIT_MS);
    return () => clearTimeout(timer);
  }, [exitDir]);

  const onPointerDown = (e) => {
    if (exitDir) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  const onPointerMove = (e) => {
    if (!dragging || !start.current) return;
    setOffset({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * 0.35 });
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    start.current = null;
    if (offset.x > SWIPE_THRESHOLD) onDecide("right");
    else if (offset.x < -SWIPE_THRESHOLD) onDecide("left");
    else setOffset({ x: 0, y: 0 }); // snap back
  };

  const progress = exitDir ? 1 : Math.min(Math.abs(offset.x) / SWIPE_THRESHOLD, 1);
  const showLike = exitDir ? exitDir === "right" : offset.x > 0;
  // While exiting, the card flies off screen in the chosen direction
  const x = exitDir ? (exitDir === "right" ? "120vw" : "-120vw") : `${offset.x}px`;
  const y = exitDir ? offset.y + 40 : offset.y;
  const rotate = exitDir ? (exitDir === "right" ? 25 : -25) : offset.x / 18;

  return (
    <div
      className="absolute inset-0 z-20 cursor-grab touch-none active:cursor-grabbing"
      style={{
        transform: `translate(${x}, ${y}px) rotate(${rotate}deg)`,
        transition: dragging ? "none" : `transform ${EXIT_MS}ms cubic-bezier(.2,.8,.3,1)`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <ProfileCard
        user={user}
        badge={
          (offset.x !== 0 || exitDir) && (
            <span
              className={`absolute top-6 rounded-xl border-[3px] px-3 py-1 font-display text-xl font-extrabold tracking-widest ${
                showLike
                  ? "left-6 -rotate-12 border-success text-success"
                  : "right-6 rotate-12 border-crimson-400 text-crimson-300"
              }`}
              style={{ opacity: progress }}
            >
              {showLike ? "CONNECT" : "PASS"}
            </span>
          )
        }
      />
    </div>
  );
}
