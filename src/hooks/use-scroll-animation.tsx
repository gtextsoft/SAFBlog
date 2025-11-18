import { useEffect, useRef, useState } from "react";

/**
 * Hook to trigger animations when element enters viewport
 * Usage: Add 'animate-on-scroll' class to element and use this hook
 */
export const useScrollAnimation = (options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optionally disconnect after first trigger
          // observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
        ...options,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isVisible };
};

/**
 * Hook to add scroll-triggered visibility class to elements
 */
export const useScrollVisibility = (deps?: readonly unknown[]) => {
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
        rootMargin: "0px 0px -50px 0px",
      }
    );

    // Function to observe all animate-on-scroll elements
    const observeElements = () => {
      // Use requestAnimationFrame to ensure DOM updates are complete
      requestAnimationFrame(() => {
        const elements = document.querySelectorAll(".animate-on-scroll:not(.visible)");
        elements.forEach((el) => {
          // Check if element is already in viewport
          const rect = el.getBoundingClientRect();
          const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (isInViewport) {
            // Immediately make visible if already in viewport
            el.classList.add("visible");
          } else {
            // Otherwise observe for when it enters viewport
            observer.observe(el);
          }
        });
      });
    };

    // Initial observation
    observeElements();

    // Use MutationObserver to watch for dynamically added elements
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, deps || []);
};

