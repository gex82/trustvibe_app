'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminGuard } from '../../lib/useAdminGuard';

const nav = [
  { href: '/users', label: 'Users' },
  { href: '/projects', label: 'Projects' },
  { href: '/cases', label: 'Cases' },
  { href: '/deposits', label: 'Deposits' },
  { href: '/reliability', label: 'Reliability' },
  { href: '/subscriptions', label: 'Subscriptions' },
  { href: '/concierge', label: 'Concierge' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/config', label: 'Config' },
];

export default function AdminLayout({ children }: { children: any }) {
  const router = useRouter();
  const guard = useAdminGuard();

  useEffect(() => {
    if (!guard.loading && (!guard.isAuthenticated || !guard.isAdmin)) {
      router.replace('/login');
    }
  }, [guard.isAdmin, guard.isAuthenticated, guard.loading, router]);

  if (guard.loading) {
    return (
      <main className="container">
        <section className="card">
          <p className="muted">Verifying admin access...</p>
        </section>
      </main>
    );
  }

  if (!guard.isAuthenticated || !guard.isAdmin) {
    return (
      <main className="container">
        <section className="card">
          <p className="muted">Redirecting to admin login...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="card" style={{ marginBottom: 16 }}>
        <strong>TrustVibe Admin Console</strong>
        <nav style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="muted" data-testid={`admin-nav-${item.label.toLowerCase()}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </main>
  );
}
