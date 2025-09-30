export const metadata = { title: 'Root Layout Bridge' };

// This minimal root layout exists only because a top-level `app/` directory is present.
// It delegates entirely to the real application under `src/app`.
// Once the stray `app/offline` directory is fully removed, this file can be deleted.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}