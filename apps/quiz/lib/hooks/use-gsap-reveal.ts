"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

type FromDirection = "bottom" | "right" | "left" | "top";

interface UseGsapRevealOptions {
  delay?: number;
  duration?: number;
  from?: FromDirection;
  distance?: number;
  scale?: number;
  scaleX?: number;
  rotation?: number;
  transformOrigin?: string;
  ease?: string;
  enabled?: boolean;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getFromVars(from: FromDirection, distance: number) {
  switch (from) {
    case "bottom": return { y: distance };
    case "top": return { y: -distance };
    case "right": return { x: distance };
    case "left": return { x: -distance };
  }
}

export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseGsapRevealOptions = {}
) {
  const {
    delay = 0,
    duration = 0.5,
    from = "bottom",
    distance = 20,
    scale,
    scaleX,
    rotation,
    transformOrigin,
    ease = "power2.out",
    enabled = true,
  } = options;

  const ref = useRef<T>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!enabled || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;

    if (prefersReducedMotion()) {
      gsap.set(ref.current, { opacity: 1 });
      return;
    }

    const fromVars: gsap.TweenVars = {
      opacity: 0,
      ...getFromVars(from, distance),
      ...(scale != null && { scale }),
      ...(scaleX != null && { scaleX }),
      ...(rotation != null && { rotation }),
      ...(transformOrigin != null && { transformOrigin }),
    };

    gsap.fromTo(ref.current, fromVars, {
      opacity: 1,
      x: 0,
      y: 0,
      ...(scale != null && { scale: 1 }),
      ...(scaleX != null && { scaleX: 1 }),
      ...(rotation != null && { rotation: 0 }),
      duration,
      delay,
      ease,
    });
  }, [enabled, delay, duration, from, distance, scale, scaleX, rotation, transformOrigin, ease]);

  return ref;
}

interface UseGsapStaggerOptions extends UseGsapRevealOptions {
  selector?: string;
  stagger?: number;
}

export function useGsapStagger<T extends HTMLElement = HTMLDivElement>(
  options: UseGsapStaggerOptions = {}
) {
  const {
    selector = ":scope > *",
    stagger = 0.08,
    delay = 0,
    duration = 0.4,
    from = "bottom",
    distance = 20,
    ease = "power2.out",
    enabled = true,
  } = options;

  const ref = useRef<T>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!enabled || hasAnimated.current || !ref.current) return;
    hasAnimated.current = true;

    const targets = ref.current.querySelectorAll(selector);
    if (!targets.length) return;

    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1 });
      return;
    }

    gsap.fromTo(targets, {
      opacity: 0,
      ...getFromVars(from, distance),
    }, {
      opacity: 1,
      x: 0,
      y: 0,
      duration,
      delay,
      ease,
      stagger,
    });
  }, [enabled, selector, stagger, delay, duration, from, distance, ease]);

  return ref;
}
