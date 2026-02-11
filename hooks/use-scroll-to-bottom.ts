import { useEffect, useRef } from "react";

export function useScrollToBottom<T extends HTMLElement>(
  dependency: unknown[]
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependency);

  return containerRef;
}
