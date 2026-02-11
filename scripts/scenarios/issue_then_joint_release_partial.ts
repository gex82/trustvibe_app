const {
  acceptAgreementHandler,
  createProjectHandler,
  fundHoldHandler,
  proposeJointReleaseHandler,
  raiseIssueHoldHandler,
  requestCompletionHandler,
  selectContractorHandler,
  signJointReleaseHandler,
  submitQuoteHandler,
} = require('../../functions/src/http/handlers');

function req(uid: string, role: 'customer' | 'contractor' | 'admin', data: unknown): any {
  return { auth: { uid, token: { role } }, data };
}

async function run(): Promise<void> {
  const customerId = 'customer-002';
  const contractorId = 'contractor-002';

  const created = await createProjectHandler(
    req(customerId, 'customer', {
      category: 'painting',
      title: 'Issue then Joint Release',
      description: 'Paint two bedrooms and hallway.',
      photos: [],
      municipality: 'Caguas',
      desiredTimeline: 'Within 10 days',
    })
  );

  const projectId = created.project.id;
  const quote = await submitQuoteHandler(
    req(contractorId, 'contractor', {
      projectId,
      priceCents: 90000,
      timelineDays: 4,
      scopeNotes: 'Includes paint materials and cleanup.',
    })
  );

  await selectContractorHandler(req(customerId, 'customer', { projectId, quoteId: quote.quote.id }));
  await acceptAgreementHandler(req(customerId, 'customer', { agreementId: projectId }));
  await acceptAgreementHandler(req(contractorId, 'contractor', { agreementId: projectId }));
  await fundHoldHandler(req(customerId, 'customer', { projectId }));
  await requestCompletionHandler(req(contractorId, 'contractor', { projectId }));
  await raiseIssueHoldHandler(req(customerId, 'customer', { projectId, reason: 'Partial repaint required in hallway.' }));

  const proposal = await proposeJointReleaseHandler(
    req(customerId, 'customer', {
      projectId,
      releaseToContractorCents: 60000,
      refundToCustomerCents: 30000,
    })
  );

  await signJointReleaseHandler(req(customerId, 'customer', { projectId, proposalId: proposal.proposalId }));
  await signJointReleaseHandler(req(contractorId, 'contractor', { projectId, proposalId: proposal.proposalId }));

  console.log(JSON.stringify({ scenario: 'issue_then_joint_release_partial', projectId, proposalId: proposal.proposalId, status: 'done' }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
