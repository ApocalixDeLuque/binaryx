/* "use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/favicon/binaryx.png"
            alt="binaryx"
            width={48}
            height={48}
            className="h-12 w-12 dark:invert"
            priority
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          binaryx
        </h1>
        <p className="mt-4 text-sm md:text-base text-muted-foreground">
          Herramientas abiertas para conversiones entre bases y aritmética
          binaria. Minimalista, precisa y en evolución constante.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/conversiones">Ir a Conversiones</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/operaciones">Ir a Operaciones</Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border p-4 rounded">
          <h3 className="font-medium">Conversiones exactas</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Decimal, binario, octal y hexadecimal con soporte de fracciones,
            redondeo y agrupado visual.
          </p>
        </div>
        <div className="border p-4 rounded">
          <h3 className="font-medium">Con signo (C2)</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Complemento a dos inteligente: solo cuando aplica, con endianness y
            ancho mínimo.
          </p>
        </div>
        <div className="border p-4 rounded">
          <h3 className="font-medium">Código abierto</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Proyecto open source pensado para crecer: puertas lógicas,
            aritmética extendida y más próximamente.
          </p>
        </div>
      </section>
    </main>
  );
} */
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import LetterGlitch from "@/components/LetterGlitch";
import { Calculator, Code2, GitBranch, Binary, Cpu } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero with LetterGlitch background */}
      <section className="relative overflow-hidden">
        {/* Put background at z-0 so it stays behind content, not behind the page */}
        <div className="absolute inset-0 z-0 opacity-100 dark:opacity-100">
          <LetterGlitch
            glitchColors={["#e5e7eb", "#9ca3af", "#6b7280"]}
            glitchSpeed={45}
            centerVignette={true}
            outerVignette={false}
            smooth={true}
            characters="01BINARYX<>[]{}#@$&%"
          />
        </div>
        {/* heavy white overlay */}
        {/* <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/60 via-background/70 to-background" /> */}

        <div className="relative z-10 container mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="flex flex-col items-center text-center gap-4">
            <Image
              src="/favicon/binaryx.png"
              alt="binaryx"
              width={56}
              height={56}
              className="h-14 w-14 dark:invert"
              priority
            />
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white">
              binaryx
            </h1>
            <p className="text-sm md:text-base text-white opacity-80 max-w-md">
              Herramientas abiertas para conversiones entre bases y aritmética
              binaria. Minimalista, precisa y en evolución constante.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="text-white">
                <Link href="/operaciones">Ir a Operaciones</Link>
              </Button>
              <Button asChild className="text-white">
                <Link href="/conversiones">Ir a Conversiones</Link>
              </Button>
              <Button variant="ghost" asChild className="text-white">
                <Link
                  href="https://github.com/ApocalixDeLuque/binaryx"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver en GitHub
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="container mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Conversiones exactas"
            icon={<Binary className="h-5 w-5" />}
            text="Decimal, binario, octal y hexadecimal. Fracciones con redondeo y agrupado visual."
          />
          <FeatureCard
            title="Con signo (C2) inteligente"
            icon={<Cpu className="h-5 w-5" />}
            text="Complemento a dos solo cuando aplica. Endianness y ancho mínimo automático."
          />
          <FeatureCard
            title="Código abierto"
            icon={<GitBranch className="h-5 w-5" />}
            text="Pensado para crecer: lógica digital, más operaciones y visualizaciones."
          />
        </div>
      </section>

      {/* Details */}
      <section className="container mx-auto max-w-6xl px-6 pb-20 md:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard
            title="Flujos claros"
            text="Desgloses paso a paso para entender cada conversión. Tablas para parte entera y fraccionaria, recap y unión."
            icon={<Calculator className="h-5 w-5" />}
          />
          <InfoCard
            title="Detalles que importan"
            text="Respetamos signos explícitos, evitamos C2 para positivos y fracciones, y cuidamos el ancho mínimo necesario."
            icon={<Code2 className="h-5 w-5" />}
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border rounded p-5">
      <div className="flex items-center gap-2 text-sm mb-2">
        <div className="h-8 w-8 rounded-full bg-muted/60 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function InfoCard({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded border p-5 flex items-start gap-3">
      <div className="h-9 w-9 rounded-full bg-muted/60 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
