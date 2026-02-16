const {
  acceptAgreementHandler,
  adminSetConfigHandler,
  createProjectHandler,
  fundHoldHandler,
  selectContractorHandler,
  submitQuoteHandler,
  createMilestonesHandler,
  approveMilestoneHandler,
} = require('../../functions/src/http/handlers');

function req(uid: string, role: 'customer' | 'contractor' | 'admin', data: unknown): any {
  return { auth: { uid, token: { role } }, data };
}

async function run(): Promise<void> {
  const customerId = 'customer-001';
  const contractorId = 'contractor-001';
  const adminId = 'admin-001';

  await adminSetConfigHandler(
    req(adminId, 'admin', {
      featureFlags: {
        milestonePaymentsEnabled: true,
      },
    })
  );

  const created = await createProjectHandler(
    req(customerId, 'customer', {
      category: 'electrical',
      title: 'Milestone release scenario',
      description: 'Upgrade panel and add new circuits.',
      photos: [],
      municipality: 'San Juan',
      desiredTimeline: 'Within 14 days',
    })
  );
  const projectId = created.project.id;
  const quote = await submitQuoteHandler(
    req(contractorId, 'contractor', {
      projectId,
      priceCents: 120000,
      timelineDays: 10,
      scopeNotes: 'Two milestone execution plan.',
    })
  );
  await selectContractorHandler(req(customerId, 'customer', { projectId, quoteId: quote.quote.id }));
  await acceptAgreementHandler(req(customerId, 'customer', { agreementId: projectId }));
  await acceptAgreementHandler(req(contractorId, 'contractor', { agreementId: projectId }));
  await fundHoldHandler(req(customerId, 'customer', { projectId }));

  const milestones = await createMilestonesHandler(
    req(customerId, 'customer', {
      projectId,
      milestones: [
        { title: 'Material prep', amountCents: 50000, acceptanceCriteria: 'Materials delivered' },
        { title: 'Final install', amountCents: 70000, acceptanceCriteria: 'Inspection approved' },
      ],
    })
  );
  await approveMilestoneHandler(
    req(customerId, 'customer', {
      projectId,
      milestoneId: milestones.milestones[0].id,
    })
  );

  console.log(JSON.stringify({ scenario: 'milestone_partial_release', projectId, status: 'done' }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
