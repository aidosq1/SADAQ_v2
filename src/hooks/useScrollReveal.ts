"use client";

import { useEffect, useRef, useState, RefObject } from "react";

/**
 * Hook for scroll-triggered reveal animations.
 * Elements with the class "reveal" will get "visible" class added when they enter viewport.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const containerRef = useScrollReveal();
 *   return (
 *     <div ref={containerRef}>
 *       <div className="reveal">This will animate in</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    const currentRef = ref.current;
    if (!currentRef) return;

    const elements = currentRef.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  return ref;
}

/**
 * Hook for detecting scroll position.
 * Useful for header transparency effects.
 *
 * Usage:
 * ```tsx
 * function Header() {
 *   const isScrolled = useScrollPosition(100);
 *   return (
 *     <header className={isScrolled ? "bg-solid" : "bg-transparent"}>
 *       ...
 *     </header>
 *   );
 * }
 * ```
 */
export function useScrollPosition(threshold: number = 100): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    // Check initial position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
}
