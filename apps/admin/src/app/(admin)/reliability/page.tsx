'use client';

import { useCollectionData } from '../../../lib/useCollectionData';

export default function ReliabilityPage() {
  const { rows, loading, error } = useCollectionData('reliabilityScores');

  return (
    <section className="card">
      <h1>Reliability Scores</h1>
      <p className="muted">Contractor trust metrics used for ranking, auto-release, and high-ticket eligibility.</p>
      {loading ? <p className="muted">Loading...</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Contractor</th>
            <th>Score</th>
            <th>Auto-release</th>
            <th>Large Jobs</th>
            <th>High-ticket</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.contractorId ?? row.id}</td>
              <td>{row.score ?? '-'}</td>
              <td>{row.eligibility?.autoRelease ? 'Yes' : 'No'}</td>
              <td>{row.eligibility?.largeJobs ? 'Yes' : 'No'}</td>
              <td>{row.eligibility?.highTicket ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
