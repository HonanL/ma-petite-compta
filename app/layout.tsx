import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ma Petite Compta",
  description: "La comptabilité simple pour apprendre et gérer votre petit business.",
  icons: {
    icon: "/logo-ma-petite-compta.png?v=20260604",
    apple: "/logo-ma-petite-compta.png?v=20260604"
  },
  openGraph: {
    title: "Ma Petite Compta",
    description: "La comptabilité simple pour apprendre et gérer votre petit business.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ma Petite Compta"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Ma Petite Compta",
    description: "La comptabilité simple pour apprendre et gérer votre petit business.",
    images: ["/og-image.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
