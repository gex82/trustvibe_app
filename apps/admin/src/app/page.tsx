import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container grid">
      <h1>TrustVibe Admin</h1>
      <p className="muted">Operations without mediation. Execute only based on signed instructions or external final documents.</p>
      <div className="card grid">
        <Link href="/users">Users</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/cases">Cases</Link>
        <Link href="/reviews">Reviews</Link>
        <Link href="/config">Config</Link>
      </div>
    </main>
  );
}
