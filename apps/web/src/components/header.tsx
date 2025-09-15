"use client";
import Link from "next/link";
import Image from "next/image";
import ThemeSwitch from "@/components/theme-switch";
import { usePathname } from "next/navigation";

export default function Header() {
  const links = [
    { to: "/conversiones", label: "Conversiones" },
    { to: "/operaciones", label: "Operaciones" },
  ] as const;
  const pathname = usePathname();

  // Theme handled by ThemeSwitch

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
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
}
