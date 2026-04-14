export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar được thêm ở Phase 4 */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
