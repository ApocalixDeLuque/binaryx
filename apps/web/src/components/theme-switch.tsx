"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const value = mounted ? (theme as "light" | "dark" | "system") : "system";

  const handleChange = (val: string) => {
    if (!val) return;
    setTheme(val as "light" | "dark" | "system");
  };

  const index = value === "light" ? 0 : value === "dark" ? 1 : 2;
  const ITEM = 24; // px (w-6/h-6)
  const GAP = 4; // px (gap-1)
  const PAD = 2; // px (p-0.5)

  return (
    <div className="flex items-center">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={handleChange}
        aria-label="Theme"
        className="relative rounded-full border border-input p-0.5 bg-muted/40 gap-1 overflow-hidden"
        size="sm"
      >
        {/* sliding highlight */}
        <span
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 z-0 rounded-full bg-background ring-1 ring-border transition-transform"
          style={{
            width: ITEM,
            height: ITEM,
            transform: `translateX(${PAD + index * (ITEM + GAP)}px)`,
            transitionDuration: "220ms",
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
        <ToggleGroupItem
          value="light"
          aria-label="Tema claro"
          className="relative z-10 rounded-full h-6 w-6 px-0 transition-colors duration-200 bg-transparent border-0 shadow-none ring-0 focus:ring-0 focus-visible:ring-0 outline-none text-muted-foreground data-[state=on]:text-foreground"
        >
          <Sun className="h-3.5 w-3.5" />
          <span className="sr-only">Claro</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="dark"
          aria-label="Tema oscuro"
          className="relative z-10 rounded-full h-6 w-6 px-0 transition-colors duration-200 bg-transparent border-0 shadow-none ring-0 focus:ring-0 focus-visible:ring-0 outline-none text-muted-foreground data-[state=on]:text-foreground"
        >
          <Moon className="h-3.5 w-3.5" />
          <span className="sr-only">Oscuro</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="system"
          aria-label="Tema del sistema"
          className="relative z-10 rounded-full h-6 w-6 px-0 transition-colors duration-200 bg-transparent border-0 shadow-none ring-0 focus:ring-0 focus-visible:ring-0 outline-none text-muted-foreground data-[state=on]:text-foreground"
        >
          <Monitor className="h-3.5 w-3.5" />
          <span className="sr-only">Automático</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

export default ThemeSwitch;
