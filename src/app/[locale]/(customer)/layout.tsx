import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ZaloChatWidget } from '@/components/shared/ZaloChatWidget';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const zaloOaId = process.env.NEXT_PUBLIC_ZALO_OA_ID ?? '';

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* Zalo Chat Widget — chỉ hiện trên trang customer, không hiện trong admin */}
      {zaloOaId && <ZaloChatWidget oaId={zaloOaId} />}
    </div>
  );
}
