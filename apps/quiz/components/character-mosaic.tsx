"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import type { Character } from "@/lib/types";

const SLOTS = 8;
const ROTATE_INTERVAL = 3000; // ms between swaps

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Shuffle array in place (Fisher-Yates) and return it. */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build an array of `count` items by drawing randomly from `pool`.
 * Each slot picks independently so the order is fully randomised,
 * even when the pool is smaller than `count` (duplicates will appear
 * but won't follow a repeating pattern across rows).
 */
function randomFill<T>(pool: T[], count: number): T[] {
  return Array.from(
    { length: count },
    () => pool[Math.floor(Math.random() * pool.length)]
  );
}

// Deterministic per-position vertical offsets (px) to break grid rigidity.
const Y_OFFSETS_TOP = [4, 8, -10, 4];
const Y_OFFSETS_BOT = [6, -8, 10, -4];

/**
 * Two rows of overlapping circular character headshots. The initial 8 are
 * randomly selected from the full pool and revealed with a GSAP stagger.
 * After the intro animation, individual slots crossfade to a new random
 * character every few seconds.
 */
export function CharacterMosaic({ characters }: { characters: Character[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const introComplete = useRef(false);

  // Pick a random initial set of 8 — fully randomised so rows don't mirror
  const [visible, setVisible] = useState<Character[]>(() => {
    if (characters.length === 0) return [];
    return randomFill(characters, SLOTS);
  });

  // Re-seed when characters arrive (first render has [] from SSR)
  const seeded = useRef(false);
  useEffect(() => {
    if (characters.length === 0 || seeded.current) return;
    seeded.current = true;
    setVisible(randomFill(characters, SLOTS));
  }, [characters]);

  // --- Intro stagger animation ---
  useEffect(() => {
    if (!containerRef.current || hasAnimated.current || visible.length === 0)
      return;
    hasAnimated.current = true;

    const avatars = containerRef.current.querySelectorAll("[data-mosaic-slot]");
    if (!avatars.length) return;

    if (prefersReducedMotion()) {
      gsap.set(avatars, { opacity: 1, scale: 1 });
      introComplete.current = true;
      return;
    }

    gsap.fromTo(
      avatars,
      { opacity: 0, scale: 0.3 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
        stagger: 0.5,
        onComplete: () => {
          introComplete.current = true;
        },
      }
    );
  }, [visible]);

  // --- Rotating crossfade ---
  const rotateSlot = useCallback(() => {
    if (
      !containerRef.current ||
      !introComplete.current ||
      characters.length <= SLOTS
    )
      return;

    setVisible((prev) => {
      // Pick a random slot to swap
      const slotIdx = Math.floor(Math.random() * SLOTS);

      // Find a character not currently displayed
      const currentIds = new Set(prev.map((c) => c.id));
      const available = characters.filter((c) => !currentIds.has(c.id));
      if (available.length === 0) return prev;

      const next = available[Math.floor(Math.random() * available.length)];

      // Crossfade the image inside this slot
      const slot = containerRef.current?.querySelectorAll("[data-mosaic-slot]")[
        slotIdx
      ] as HTMLElement | undefined;

      if (slot && !prefersReducedMotion()) {
        const img = slot.querySelector("[data-mosaic-img]") as HTMLElement | null;
        if (img) {
          gsap.to(img, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              // State update triggers re-render with new image
              setVisible((cur) => {
                const updated = [...cur];
                updated[slotIdx] = next;
                return updated;
              });
              // After React re-renders with the new image, fade back in
              requestAnimationFrame(() => {
                const freshImg = slot.querySelector(
                  "[data-mosaic-img]"
                ) as HTMLElement | null;
                if (freshImg) {
                  gsap.fromTo(
                    freshImg,
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
                  );
                }
              });
            },
          });
          return prev; // Don't update state yet — onComplete will
        }
      }

      // Fallback: instant swap (reduced motion or missing element)
      const updated = [...prev];
      updated[slotIdx] = next;
      return updated;
    });
  }, [characters]);

  useEffect(() => {
    if (characters.length <= SLOTS) return;
    const id = setInterval(rotateSlot, ROTATE_INTERVAL);
    return () => clearInterval(id);
  }, [characters, rotateSlot]);

  if (characters.length === 0) return null;

  const topRow = visible.slice(0, 4);
  const bottomRow = visible.slice(4, 8);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1 sm:gap-2">
      {/* Top row */}
      <div className="flex items-center -space-x-3 sm:-space-x-5">
        {topRow.map((char, i) => (
          <AvatarSlot
            key={`top-${i}`}
            character={char}
            yOffset={Y_OFFSETS_TOP[i]}
          />
        ))}
      </div>

      {/* Bottom row */}
      <div className="flex items-center -space-x-3 sm:-space-x-5 -mt-2 sm:-mt-4">
        {bottomRow.map((char, i) => (
          <AvatarSlot
            key={`bot-${i}`}
            character={char}
            yOffset={Y_OFFSETS_BOT[i]}
          />
        ))}
      </div>
    </div>
  );
}

function AvatarSlot({
  character,
  yOffset = 0,
}: {
  character: Character;
  yOffset?: number;
}) {
  return (
    <div
      data-mosaic-slot
      className="opacity-0"
      style={{ transform: `translateY(${yOffset}px)` }}
    >
      <div className="w-14 h-14 sm:w-[128px] sm:h-[128px] rounded-full overflow-hidden ring-[3px] ring-background shadow-md">
        <div data-mosaic-img>
          {character.imageUrl ? (
            <Image
              src={character.imageUrl}
              alt={character.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs font-semibold">
                {character.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
