const { createProjectHandler, selectContractorHandler, submitQuoteHandler } = require('../../functions/src/http/handlers');
const { createHighTicketCaseHandler, submitConciergeBidHandler } = require('../../functions/src/http/productionHandlers');

function req(uid: string, role: 'customer' | 'contractor' | 'admin', data: unknown): any {
  return { auth: { uid, token: { role } }, data };
}

async function run(): Promise<void> {
  const customerId = 'customer-001';
  const contractorId = 'contractor-001';

  const created = await createProjectHandler(
    req(customerId, 'customer', {
      category: 'roofing',
      title: 'High-ticket concierge project',
      description: 'Large roof replacement and structural reinforcement.',
      photos: [],
      municipality: 'San Juan',
      desiredTimeline: 'Within 30 days',
      budgetMinCents: 550000,
      budgetMaxCents: 850000,
    })
  );
  const projectId = created.project.id;

  const quote = await submitQuoteHandler(
    req(contractorId, 'contractor', {
      projectId,
      priceCents: 700000,
      timelineDays: 21,
      scopeNotes: 'Full roof replacement with staged milestones.',
    })
  );
  await selectContractorHandler(req(customerId, 'customer', { projectId, quoteId: quote.quote.id }));

  const concierge = await createHighTicketCaseHandler(
    req(customerId, 'customer', {
      projectId,
      intakeNotes: 'Customer requests concierge-managed bid process.',
    })
  );
  await submitConciergeBidHandler(
    req(contractorId, 'contractor', {
      caseId: concierge.highTicketCase.id,
      projectId,
      amountCents: 700000,
      milestoneTemplate: [
        { title: 'Materials secured', amountCents: 250000, acceptanceCriteria: 'All materials on site' },
        { title: 'Installation complete', amountCents: 450000, acceptanceCriteria: 'Final inspection passed' },
      ],
    })
  );

  console.log(JSON.stringify({ scenario: 'high_ticket_concierge', projectId, caseId: concierge.highTicketCase.id, status: 'done' }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
