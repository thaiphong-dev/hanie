import Image from 'next/image';
import { Link } from '@/lib/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col">
      {/* Simple top bar */}
      <header className="px-6 py-4">
        <Link href="/" className="inline-block">
          <Image
            src="/logo.svg"
            alt="Hanie Studio"
            width={80}
            height={32}
            className="opacity-80"
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="py-6 text-center">
        <p className="font-body text-xs text-text-muted">
          © {new Date().getFullYear()} Hanie Studio
        </p>
      </footer>
    </div>
  );
}
