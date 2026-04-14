// Root page — middleware redirects / → /vi/
// This page should never be rendered directly
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/vi');
}
