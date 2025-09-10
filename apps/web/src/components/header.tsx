"use client";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Monitor, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const links = [
    { to: "/", label: "Operaciones" },
    { to: "/conversiones", label: "Conversiones" },
  ] as const;
  const pathname = usePathname();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-3 py-2">
        {/* Left: logo + brand */}
        <div className="flex items-center gap-2">
          <Image
            src="/favicon/binaryx.png"
            alt="binaryx"
            width={24}
            height={24}
            className="h-6 w-6 dark:invert"
          />
          <Link href="/" className="font-semibold tracking-tight">
            binaryx
          </Link>
        </div>

        {/* Center: nav */}
        <nav className="hidden md:flex gap-3 text-sm absolute left-1/2 -translate-x-1/2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              className={
                pathname === to ? "font-medium" : "text-muted-foreground"
              }
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: theme */}
        <div className="flex items-center gap-3">
          <div className="flex" role="tablist" aria-label="Theme">
            {mounted ? (
              <>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTheme("system")}
                  className="rounded-r-none"
                  aria-label="System theme"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTheme("light")}
                  className="rounded-none"
                  aria-label="Light theme"
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTheme("dark")}
                  className="rounded-l-none"
                  aria-label="Dark theme"
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </>
            ) : (
              // Fallback buttons with default styling during SSR
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-r-none"
                  aria-label="System theme"
                  disabled
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-none"
                  aria-label="Light theme"
                  disabled
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-l-none"
                  aria-label="Dark theme"
                  disabled
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
