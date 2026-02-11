const {
  acceptAgreementHandler,
  approveReleaseHandler,
  createProjectHandler,
  fundHoldHandler,
  requestCompletionHandler,
  selectContractorHandler,
  submitQuoteHandler,
} = require('../../functions/src/http/handlers');

function req(uid: string, role: 'customer' | 'contractor' | 'admin', data: unknown): any {
  return { auth: { uid, token: { role } }, data };
}

async function run(): Promise<void> {
  const customerId = 'customer-001';
  const contractorId = 'contractor-001';

  const created = await createProjectHandler(
    req(customerId, 'customer', {
      category: 'plumbing',
      title: 'Happy Path Release',
      description: 'Replace kitchen faucet and test line pressure.',
      photos: [],
      municipality: 'San Juan',
      desiredTimeline: 'Within 5 days',
    })
  );

  const projectId = created.project.id;
  const quote = await submitQuoteHandler(
    req(contractorId, 'contractor', {
      projectId,
      priceCents: 70000,
      timelineDays: 2,
      scopeNotes: 'Labor and parts included.',
    })
  );

  await selectContractorHandler(req(customerId, 'customer', { projectId, quoteId: quote.quote.id }));
  await acceptAgreementHandler(req(customerId, 'customer', { agreementId: projectId }));
  await acceptAgreementHandler(req(contractorId, 'contractor', { agreementId: projectId }));
  await fundHoldHandler(req(customerId, 'customer', { projectId }));
  await requestCompletionHandler(req(contractorId, 'contractor', { projectId }));
  await approveReleaseHandler(req(customerId, 'customer', { projectId }));

  console.log(JSON.stringify({ scenario: 'happy_path_release', projectId, status: 'done' }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
