const {
  acceptAgreementHandler,
  adminExecuteOutcomeHandler,
  createProjectHandler,
  fundHoldHandler,
  raiseIssueHoldHandler,
  requestCompletionHandler,
  selectContractorHandler,
  submitQuoteHandler,
  uploadResolutionDocumentHandler,
} = require('../../functions/src/http/handlers');

function req(uid: string, role: 'customer' | 'contractor' | 'admin', data: unknown): any {
  return { auth: { uid, token: { role } }, data };
}

async function run(): Promise<void> {
  const customerId = 'customer-003';
  const contractorId = 'contractor-003';
  const adminId = 'admin-001';

  const created = await createProjectHandler(
    req(customerId, 'customer', {
      category: 'roofing',
      title: 'Issue then External Resolution',
      description: 'Roof patch and sealant application.',
      photos: [],
      municipality: 'Ponce',
      desiredTimeline: 'Within 14 days',
    })
  );

  const projectId = created.project.id;
  const quote = await submitQuoteHandler(
    req(contractorId, 'contractor', {
      projectId,
      priceCents: 120000,
      timelineDays: 5,
      scopeNotes: 'Patch leak area and seal full edge lines.',
    })
  );

  await selectContractorHandler(req(customerId, 'customer', { projectId, quoteId: quote.quote.id }));
  await acceptAgreementHandler(req(customerId, 'customer', { agreementId: projectId }));
  await acceptAgreementHandler(req(contractorId, 'contractor', { agreementId: projectId }));
  await fundHoldHandler(req(customerId, 'customer', { projectId }));
  await requestCompletionHandler(req(contractorId, 'contractor', { projectId }));
  await raiseIssueHoldHandler(req(customerId, 'customer', { projectId, reason: 'Leak persists after service.' }));

  await uploadResolutionDocumentHandler(
    req(customerId, 'customer', {
      projectId,
      documentUrl: 'https://example.com/final-settlement-roof.pdf',
      resolutionType: 'signed_settlement',
      summary: 'Signed settlement requires full refund to customer.',
    })
  );

  await adminExecuteOutcomeHandler(
    req(adminId, 'admin', {
      projectId,
      caseId: projectId,
      outcomeType: 'refund_full',
      releaseToContractorCents: 0,
      refundToCustomerCents: 120000,
      docReference: 'https://example.com/final-settlement-roof.pdf',
    })
  );

  console.log(JSON.stringify({ scenario: 'issue_then_external_resolution_refund_full', projectId, status: 'done' }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
