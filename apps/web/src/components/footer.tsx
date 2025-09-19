import Image from "next/image";
import Link from "next/link";
import { Bug, Github, Sparkles, Star, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const primaryActions = [
  {
    label: "Reportar un bug",
    href: "https://github.com/ApocalixDeLuque/binaryx/issues/new?labels=bug&title=%5BBug%5D%3A%20Describe%20el%20problema%20&body=Describe%20los%20pasos%20para%20reproducirlo%2C%20el%20comportamiento%20esperado%20y%20cualquier%20dato%20adicional%20relevante.",
    icon: Bug,
    variant: "outline" as const,
  },
  {
    label: "Sugerir mejora",
    href: "https://github.com/ApocalixDeLuque/binaryx/issues/new?template=feature_request.yml",
    icon: Sparkles,
    variant: "outline" as const,
  },
  {
    label: "Dar estrella en GitHub",
    href: "https://github.com/ApocalixDeLuque/binaryx/stargazers",
    icon: Star,
    variant: "secondary" as const,
  },
  {
    label: "Abrir repositorio",
    href: "https://github.com/ApocalixDeLuque/binaryx",
    icon: Github,
    variant: "ghost" as const,
  },
] satisfies Array<{
  label: string;
  href: string;
  icon: LucideIcon;
  variant: "outline" | "secondary" | "ghost";
}>;

const secondaryLinks = [
  {
    label: "Documentación",
    href: "https://github.com/ApocalixDeLuque/binaryx#readme",
  },
  {
    label: "Guía de contribución",
    href: "https://github.com/ApocalixDeLuque/binaryx/blob/main/CONTRIBUTING.md",
  },
  {
    label: "Licencia",
    href: "https://github.com/ApocalixDeLuque/binaryx/blob/main/LICENSE",
  },
  {
    label: "Historial de cambios",
    href: "https://github.com/ApocalixDeLuque/binaryx/releases",
  },
] satisfies Array<{
  label: string;
  href: string;
}>;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex flex-col items-center gap-3 md:flex-row md:items-center">
            <div className="relative h-8 w-8 shrink-0">
              <Image
                src="/favicon/binaryx.png"
                alt="Logo de binaryx"
                fill
                sizes="32px"
                className="object-contain dark:invert"
              />
            </div>
            <div className="text-sm">
              <p className="font-semibold tracking-tight">binaryx</p>
              <p className="text-muted-foreground">
                Herramientas abiertas para conversiones y operaciones binarias.
              </p>
            </div>
          </div>

          <div className="grid w-full gap-2 sm:grid-cols-2 md:w-auto md:flex md:flex-wrap md:justify-end md:gap-2">
            {primaryActions.map(({ label, href, icon: Icon, variant }) => (
              <Button key={label} asChild variant={variant} size="sm" className="w-full md:w-auto">
                <Link href={href as any} target="_blank" rel="noreferrer">
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p className="text-center md:text-left">
            © {year} binaryx. Creado por la comunidad open source.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 md:justify-end">
            {secondaryLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href as any}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
