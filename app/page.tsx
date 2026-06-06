"use client";

import { ArrowRight, BookOpenCheck, FileBarChart2, ReceiptText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Language, translations } from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";

const logoPath = "/logo-ma-petite-compta.png?v=20260604";

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const ui = translations[language];
  const benefits = [
    { text: ui.landing.benefits.transactions, icon: ReceiptText },
    { text: ui.landing.benefits.journal, icon: BookOpenCheck },
    { text: ui.landing.benefits.reports, icon: FileBarChart2 }
  ];

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="no-print flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-white shadow-soft">
              <Image src={logoPath} alt="Ma Petite Compta" width={48} height={48} className="h-full w-full object-cover" priority />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold text-ink sm:text-lg">{ui.appName}</span>
              <span className="block truncate text-xs font-semibold text-moss">{ui.appSubtitle}</span>
            </span>
          </Link>

          <div className="inline-flex shrink-0 border border-line bg-white shadow-sm" style={{ borderRadius: 6 }}>
            {(["fr", "en"] as Language[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLanguage(option)}
                className={`min-h-10 px-3 text-xs font-bold ${language === option ? "bg-moss text-white" : "text-moss hover:bg-mint"}`}
                style={{ borderRadius: 5 }}
                aria-pressed={language === option}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.75fr)] lg:py-16">
          <div>
            <div className="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-line bg-white shadow-soft sm:h-28 sm:w-28">
              <Image src={logoPath} alt="Ma Petite Compta" width={112} height={112} className="h-full w-full object-cover" priority />
            </div>
            <p className="label">{ui.landing.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-moss sm:text-5xl lg:text-6xl">{ui.appName}</h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-ink sm:text-xl">{ui.heroTagline}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="button-primary w-full sm:w-auto">
                {ui.landing.start}
                <ArrowRight size={17} aria-hidden />
              </Link>
              <Link href="/transactions/new" className="button-secondary w-full sm:w-auto">
                <ReceiptText size={17} aria-hidden />
                {ui.landing.addTransaction}
              </Link>
            </div>
          </div>

          <aside className="panel p-4 sm:p-5">
            <h2 className="text-lg font-bold text-ink">{ui.landing.benefitsTitle}</h2>
            <div className="mt-4 grid gap-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <article key={benefit.text} className="flex min-h-16 items-center gap-3 rounded-md border border-line bg-mint px-4 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-moss text-white">
                      <Icon size={19} aria-hidden />
                    </span>
                    <p className="font-bold text-ink">{benefit.text}</p>
                  </article>
                );
              })}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
