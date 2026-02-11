'use client';

import { useCollectionData } from '../../../lib/useCollectionData';

export default function ReviewsPage() {
  const { rows, loading, error } = useCollectionData('reviews');

  return (
    <section className="card">
      <h1>Reviews Moderation</h1>
      <p className="muted">Flagged review queue and moderation baseline.</p>
      {loading ? <p className="muted">Loading...</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Rating</th>
            <th>Feedback</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.projectId ?? '-'}</td>
              <td>{row.rating ?? '-'}</td>
              <td>{row.feedback ?? '-'}</td>
              <td>{row.moderationStatus ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
