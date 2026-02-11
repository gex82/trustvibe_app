'use client';

import { useCollectionData } from '../../../lib/useCollectionData';

export default function ProjectsPage() {
  const { rows, loading, error } = useCollectionData('projects');

  return (
    <section className="card">
      <h1>Projects</h1>
      <p className="muted">Project and escrow status overview.</p>
      {loading ? <p className="muted">Loading...</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Customer</th>
            <th>Contractor</th>
            <th>Escrow State</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.title ?? '-'}</td>
              <td>{row.customerId ?? '-'}</td>
              <td>{row.contractorId ?? '-'}</td>
              <td>{row.escrowState ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
