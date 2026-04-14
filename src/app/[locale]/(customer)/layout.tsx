export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navbar được thêm ở Phase 2 */}
      <main>{children}</main>
      {/* Footer được thêm ở Phase 2 */}
      {/* ZaloChatWidget được thêm ở Phase 2 */}
    </div>
  );
}
