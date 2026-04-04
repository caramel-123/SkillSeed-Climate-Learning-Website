import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Leaf, Globe } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => setMounted(true), []);

  // Check for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== "undefined" && 
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setIsPressed(true);
    setTheme(isDark ? "light" : "dark");
    setTimeout(() => setIsPressed(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  if (!mounted) {
    // Prevent hydration mismatch - render placeholder with same dimensions
    return (
      <div 
        className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center ${className}`}
        aria-hidden="true"
      >
        <div className="w-[52px] h-[28px] rounded-full bg-slate-200 dark:bg-[#1E3B34]" />
      </div>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex items-center justify-center
        min-h-[44px] min-w-[44px] rounded-lg
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F6B] focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-[#0D1F18]
        ${isPressed && !prefersReducedMotion ? "scale-[0.98]" : "scale-100"}
        ${prefersReducedMotion ? "" : "transition-transform duration-100"}
        ${className}
      `}
      style={{
        background: "transparent",
        border: "none",
      }}
    >
      <span
        className="relative inline-flex items-center w-[52px] h-[28px] rounded-full"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0F3D2E 0%, #1E3B34 100%)"
            : "linear-gradient(135deg, #E8F5EF 0%, #D1FAE5 100%)",
          border: isDark ? "1px solid #2F8F6B" : "1px solid #A7F3D0",
        }}
      >
        {/* Track inner glow */}
        <span
          className={`
          absolute inset-0.5 rounded-full pointer-events-none
          ${prefersReducedMotion ? "" : "transition-opacity duration-300"}
        `}
          style={{
            background: isDark
              ? "radial-gradient(ellipse at 70% 50%, rgba(109,212,168,0.15) 0%, transparent 60%)"
              : "radial-gradient(ellipse at 30% 50%, rgba(47,143,107,0.1) 0%, transparent 60%)",
            opacity: 1,
          }}
          aria-hidden="true"
        />

        {/* Sliding thumb */}
        <span
          className={`
          absolute top-[3px] w-[20px] h-[20px] rounded-full
          flex items-center justify-center
          shadow-sm
          ${prefersReducedMotion 
            ? "" 
            : "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          }
        `}
          style={{
            left: isDark ? "calc(100% - 23px)" : "3px",
            background: isDark
              ? "linear-gradient(135deg, #2F8F6B 0%, #6DD4A8 100%)"
              : "linear-gradient(135deg, #0F3D2E 0%, #2F8F6B 100%)",
          }}
          aria-hidden="true"
        >
          {/* Light mode icon (Leaf) - visible when light */}
          <Leaf
            className={`
            w-3 h-3 text-white absolute
            ${prefersReducedMotion ? "" : "transition-all duration-200"}
          `}
            style={{
              opacity: isDark ? 0 : 1,
              transform: isDark ? "scale(0.5) rotate(-45deg)" : "scale(1) rotate(0deg)",
            }}
          />
          {/* Dark mode icon (Globe) - visible when dark */}
          <Globe
            className={`
            w-3 h-3 text-white absolute
            ${prefersReducedMotion ? "" : "transition-all duration-200"}
          `}
            style={{
              opacity: isDark ? 1 : 0,
              transform: isDark ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(45deg)",
            }}
          />
        </span>
      </span>
    </button>
  );
}
