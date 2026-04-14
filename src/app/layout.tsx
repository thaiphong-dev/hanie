// Root layout — minimal pass-through
// html/body are rendered in src/app/[locale]/layout.tsx
// Middleware always redirects / → /vi/ so this is rarely rendered directly

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
