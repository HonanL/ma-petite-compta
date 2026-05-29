import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ma Petite Compta",
  description: "MVP de comptabilité simple pour petits entrepreneurs francophones"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
