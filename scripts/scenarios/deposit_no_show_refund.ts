const {
  acceptAgreementHandler,
  createProjectHandler,
  fundHoldHandler,
  selectContractorHandler,
  submitQuoteHandler,
} = require('../../functions/src/http/handlers');
const {
  captureEstimateDepositHandler,
  createEstimateDepositHandler,
  markEstimateAttendanceHandler,
} = require('../../functions/src/http/productionHandlers');

function req(uid: string, role: 'customer' | 'contractor' | 'admin', data: unknown): any {
  return { auth: { uid, token: { role } }, data };
}

async function run(): Promise<void> {
  const customerId = 'customer-001';
  const contractorId = 'contractor-001';

  const created = await createProjectHandler(
    req(customerId, 'customer', {
      category: 'plumbing',
      title: 'Deposit No-show Scenario',
      description: 'Customer requests estimate with deposit and contractor no-show.',
      photos: [],
      municipality: 'San Juan',
      desiredTimeline: 'Within 7 days',
    })
  );
  const projectId = created.project.id;
  const quote = await submitQuoteHandler(
    req(contractorId, 'contractor', {
      projectId,
      priceCents: 85000,
      timelineDays: 3,
      scopeNotes: 'Estimate and complete service.',
    })
  );

  await selectContractorHandler(req(customerId, 'customer', { projectId, quoteId: quote.quote.id }));
  await acceptAgreementHandler(req(customerId, 'customer', { agreementId: projectId }));
  await acceptAgreementHandler(req(contractorId, 'contractor', { agreementId: projectId }));

  const deposit = await createEstimateDepositHandler(req(customerId, 'customer', { projectId }));
  await captureEstimateDepositHandler(req(customerId, 'customer', { depositId: deposit.deposit.id }));
  await markEstimateAttendanceHandler(req(contractorId, 'contractor', { depositId: deposit.deposit.id, attendance: 'contractor_no_show' }));

  await fundHoldHandler(req(customerId, 'customer', { projectId }));

  console.log(JSON.stringify({ scenario: 'deposit_no_show_refund', projectId, status: 'done' }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
