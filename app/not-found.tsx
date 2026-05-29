import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="panel max-w-md p-6 text-center">
        <p className="label">Page introuvable</p>
        <h1 className="mt-2 text-2xl font-bold">Retour à Ma Petite Compta</h1>
        <p className="mt-3 text-sm leading-6 text-moss">Cette page n&apos;existe pas dans le MVP.</p>
        <Link
          href="/"
          className="mt-5 inline-flex min-h-11 items-center justify-center bg-ink px-4 text-sm font-bold text-white"
          style={{ borderRadius: 6 }}
        >
          Ouvrir le tableau de bord
        </Link>
      </section>
    </main>
  );
}
