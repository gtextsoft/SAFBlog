import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={cn(
        "min-h-screen transition-opacity duration-300 ease-in-out",
        isTransitioning ? "opacity-0" : "opacity-100 page-enter"
      )}
    >
      {children}
    </div>
  );
};
