"use client";

import { useGsapReveal, useGsapStagger } from "@/lib/hooks/use-gsap-reveal";

interface UseResultsAnimationOptions {
  hasMatchedCharacter: boolean;
  hasAlternatives: boolean;
}

export function useResultsAnimation({
  hasMatchedCharacter,
  hasAlternatives,
}: UseResultsAnimationOptions) {
  const headerRef = useGsapReveal({
    delay: 0,
    duration: 0.5,
    from: "bottom",
    distance: 20,
    ease: "power2.out",
  });

  const avatarRef = useGsapReveal({
    delay: 0.15,
    duration: 0.5,
    scale: 0,
    rotation: -12,
    ease: "back.out(1.7)",
    enabled: hasMatchedCharacter,
  });

  const heroTextRef = useGsapReveal({
    delay: 0.35,
    duration: 0.5,
    from: "right",
    distance: 40,
    ease: "power2.out",
    enabled: hasMatchedCharacter,
  });

  const separatorRef = useGsapReveal({
    delay: 0.65,
    duration: 0.6,
    scaleX: 0,
    transformOrigin: "center",
    ease: "power2.inOut",
    enabled: hasMatchedCharacter,
  });

  const personaLabelRef = useGsapReveal({
    delay: 0.75,
    duration: 0.4,
    from: "bottom",
    distance: 15,
    ease: "power2.out",
    enabled: hasMatchedCharacter,
  });

  const personaCardRef = useGsapReveal({
    delay: 0.85,
    duration: 0.5,
    from: "bottom",
    distance: 25,
    ease: "power2.out",
    enabled: hasMatchedCharacter,
  });

  const altLabelRef = useGsapReveal({
    delay: 1.0,
    duration: 0.4,
    from: "bottom",
    distance: 15,
    ease: "power2.out",
    enabled: hasAlternatives,
  });

  const altGridRef = useGsapStagger({
    delay: 1.1,
    duration: 0.4,
    stagger: 0.08,
    from: "bottom",
    distance: 20,
    ease: "power2.out",
    enabled: hasAlternatives,
  });

  const continueRef = useGsapReveal({
    delay: 1.3,
    duration: 0.5,
    from: "bottom",
    distance: 15,
    ease: "power2.out",
  });

  return {
    headerRef,
    avatarRef,
    heroTextRef,
    separatorRef,
    personaLabelRef,
    personaCardRef,
    altLabelRef,
    altGridRef,
    continueRef,
  };
}
