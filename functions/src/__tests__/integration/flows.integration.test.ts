import { db } from '../../utils/firebase';
import { deleteApp, getApps } from 'firebase-admin/app';
import {
  acceptChangeOrderHandler,
  acceptAgreementHandler,
  adminSetConfigHandler,
  adminSetUserRoleHandler,
  adminSetPromotionHandler,
  adminExecuteOutcomeHandler,
  applyReferralCodeHandler,
  getCurrentConfigHandler,
  approveMilestoneHandler,
  approveReleaseHandler,
  createBookingRequestHandler,
  createMilestonesHandler,
  createProjectHandler,
  fundHoldHandler,
  getRecommendationsHandler,
  listFeaturedListingsHandler,
  listMessagesHandler,
  proposeChangeOrderHandler,
  proposeJointReleaseHandler,
  raiseIssueHoldHandler,
  respondBookingRequestHandler,
  requestCompletionHandler,
  sendMessageHandler,
  selectContractorHandler,
  signJointReleaseHandler,
  submitQuoteHandler,
  uploadResolutionDocumentHandler,
} from '../../http/handlers';
import {
  applyEstimateDepositToJobHandler,
  captureEstimateDepositHandler,
  createEstimateDepositHandler,
  getReliabilityScoreHandler,
  markEstimateAttendanceHandler,
} from '../../http/productionHandlers';

function req(uid: string, role: 'customer' | 'contractor' | 'admin', data: unknown): any {
  return {
    auth: {
      uid,
      token: { role },
    },
    data,
  };
}

const describeIfEmulator = process.env.FIRESTORE_EMULATOR_HOST ? describe : describe.skip;

describeIfEmulator('integration flows against emulators', () => {
  const customerId = `cust_${Date.now()}`;
  const contractorId = `cont_${Date.now()}`;
  const adminId = `admin_${Date.now()}`;

  async function createBaselineProject(): Promise<{ projectId: string; quoteId: string }> {
    const created = await createProjectHandler(
      req(customerId, 'customer', {
        category: 'plumbing',
        title: 'Kitchen leak fix',
        description: 'Need sink pipe repair and leak validation.',
        photos: ['https://example.com/project-photo.jpg'],
        municipality: 'San Juan',
        desiredTimeline: 'Within 7 days',
      })
    );

    const projectId = created.project.id;

    const quoted = await submitQuoteHandler(
      req(contractorId, 'contractor', {
        projectId,
        priceCents: 85000,
        timelineDays: 3,
        scopeNotes: 'Replace pipe section and test for pressure leaks.',
      })
    );

    await selectContractorHandler(
      req(customerId, 'customer', {
        projectId,
        quoteId: quoted.quote.id,
      })
    );

    await acceptAgreementHandler(req(customerId, 'customer', { agreementId: projectId }));
    await acceptAgreementHandler(req(contractorId, 'contractor', { agreementId: projectId }));

    await fundHoldHandler(req(customerId, 'customer', { projectId }));

    return { projectId, quoteId: quoted.quote.id };
  }

  it('project -> quote -> agreement -> fund -> completion -> approve -> release', async () => {
    const { projectId } = await createBaselineProject();

    await requestCompletionHandler(
      req(contractorId, 'contractor', {
        projectId,
        proofPhotoUrls: ['https://example.com/proof.jpg'],
      })
    );

    await approveReleaseHandler(req(customerId, 'customer', { projectId }));

    const project = (await db.collection('projects').doc(projectId).get()).data();
    expect(project?.escrowState).toBe('RELEASED_PAID');
  });

  it('issue raised -> joint release signed -> execution', async () => {
    const { projectId } = await createBaselineProject();

    await requestCompletionHandler(req(contractorId, 'contractor', { projectId }));
    await raiseIssueHoldHandler(req(customerId, 'customer', { projectId, reason: 'Need partial correction for paint damage.' }));

    const proposal = await proposeJointReleaseHandler(
      req(customerId, 'customer', {
        projectId,
        releaseToContractorCents: 65000,
        refundToCustomerCents: 20000,
      })
    );

    await signJointReleaseHandler(req(customerId, 'customer', { projectId, proposalId: proposal.proposalId }));
    await signJointReleaseHandler(req(contractorId, 'contractor', { projectId, proposalId: proposal.proposalId }));

    const project = (await db.collection('projects').doc(projectId).get()).data();
    expect(project?.escrowState).toBe('EXECUTED_RELEASE_PARTIAL');
  });

  it('issue raised -> external resolution uploaded -> admin executes full refund', async () => {
    const { projectId } = await createBaselineProject();

    await requestCompletionHandler(req(contractorId, 'contractor', { projectId }));
    await raiseIssueHoldHandler(req(customerId, 'customer', { projectId, reason: 'Work abandoned before completion.' }));

    await uploadResolutionDocumentHandler(
      req(contractorId, 'contractor', {
        projectId,
        documentUrl: 'https://example.com/settlement.pdf',
        resolutionType: 'signed_settlement',
        summary: 'Signed settlement calls for full customer refund.',
      })
    );

    await adminExecuteOutcomeHandler(
      req(adminId, 'admin', {
        projectId,
        caseId: projectId,
        outcomeType: 'refund_full',
        releaseToContractorCents: 0,
        refundToCustomerCents: 85000,
        docReference: 'https://example.com/settlement.pdf',
      })
    );

    const project = (await db.collection('projects').doc(projectId).get()).data();
    expect(project?.escrowState).toBe('EXECUTED_REFUND_FULL');
  });

  it('project messaging thread supports send/list for project parties', async () => {
    const { projectId } = await createBaselineProject();

    await sendMessageHandler(
      req(customerId, 'customer', {
        projectId,
        body: 'Customer message from integration test.',
      })
    );

    await sendMessageHandler(
      req(contractorId, 'contractor', {
        projectId,
        body: 'Contractor response from integration test.',
      })
    );

    const listed = await listMessagesHandler(req(customerId, 'customer', { projectId, limit: 20 }));
    expect(listed.messages.length).toBeGreaterThanOrEqual(2);
  });

  it('phase 2 flagged features run end-to-end when enabled', async () => {
    const { projectId } = await createBaselineProject();

    await adminSetConfigHandler(
      req(adminId, 'admin', {
        featureFlags: {
          stripeConnectEnabled: false,
          estimateDepositsEnabled: true,
          milestonePaymentsEnabled: true,
          changeOrdersEnabled: true,
          credentialVerificationEnabled: true,
          schedulingEnabled: true,
          reliabilityScoringEnabled: true,
          subscriptionsEnabled: true,
          highTicketConciergeEnabled: true,
          recommendationsEnabled: true,
          growthEnabled: true,
        },
      })
    );

    const milestoneResult = await createMilestonesHandler(
      req(customerId, 'customer', {
        projectId,
        milestones: [{ title: 'Phase 1', amountCents: 30000, acceptanceCriteria: 'Complete first deliverable.' }],
      })
    );
    expect(milestoneResult.milestones.length).toBe(1);

    const milestoneRelease = await approveMilestoneHandler(
      req(customerId, 'customer', {
        projectId,
        milestoneId: milestoneResult.milestones[0].id,
      })
    );
    expect(milestoneRelease.releasedAmountCents).toBe(30000);

    const changeOrder = await proposeChangeOrderHandler(
      req(contractorId, 'contractor', {
        projectId,
        scopeSummary: 'Add one extra service item.',
        amountDeltaCents: 5000,
        timelineDeltaDays: 1,
      })
    );
    const accepted = await acceptChangeOrderHandler(
      req(customerId, 'customer', {
        projectId,
        changeOrderId: changeOrder.changeOrder.id,
        accept: true,
      })
    );
    expect(accepted.status).toBe('ACCEPTED');

    const booking = await createBookingRequestHandler(
      req(customerId, 'customer', {
        projectId,
        startAt: '2026-02-15T10:00:00.000Z',
        endAt: '2026-02-15T12:00:00.000Z',
        note: 'Please confirm this slot.',
      })
    );
    const bookingResponse = await respondBookingRequestHandler(
      req(contractorId, 'contractor', {
        projectId,
        bookingRequestId: booking.bookingRequest.id,
        response: 'confirm',
      })
    );
    expect(bookingResponse.status).toBe('CONFIRMED');

    await adminSetPromotionHandler(
      req(adminId, 'admin', {
        code: 'DEMOFEATURE',
        type: 'featured',
        featuredContractorId: contractorId,
        active: true,
      })
    );

    const applied = await applyReferralCodeHandler(
      req(customerId, 'customer', {
        code: 'DEMOFEATURE',
        projectId,
      })
    );
    expect(applied.code).toBe('DEMOFEATURE');

    const recs = await getRecommendationsHandler(req(contractorId, 'contractor', { target: 'contractor', limit: 5 }));
    expect(Array.isArray(recs.recommendations)).toBe(true);

    const featured = await listFeaturedListingsHandler(req(customerId, 'customer', { limit: 5 }));
    expect(featured.featured.length).toBeGreaterThan(0);
  });

  it('adminSetConfig round-trips feature flags through getCurrentConfig', async () => {
    const expectedFlags = {
      stripeConnectEnabled: false,
      estimateDepositsEnabled: true,
      milestonePaymentsEnabled: true,
      changeOrdersEnabled: true,
      credentialVerificationEnabled: true,
      schedulingEnabled: true,
      reliabilityScoringEnabled: true,
      subscriptionsEnabled: true,
      highTicketConciergeEnabled: true,
      recommendationsEnabled: true,
      growthEnabled: true,
    };

    await adminSetConfigHandler(req(adminId, 'admin', { featureFlags: expectedFlags }));
    const config = await getCurrentConfigHandler(req(adminId, 'admin', {}));

    expect(config.featureFlags).toMatchObject(expectedFlags);
  });

  it('admin role management syncs profile role updates', async () => {
    const targetUserId = `role_target_${Date.now()}`;
    await adminSetUserRoleHandler(
      req(adminId, 'admin', {
        userId: targetUserId,
        role: 'contractor',
        disabled: false,
      })
    );

    const user = (await db.collection('users').doc(targetUserId).get()).data();
    expect(user?.role).toBe('contractor');
    expect(user?.disabled).toBe(false);
  });

  it('estimate request -> deposit capture -> contractor no-show -> auto-refund and reliability penalty', async () => {
    await adminSetConfigHandler(
      req(adminId, 'admin', {
        featureFlags: {
          estimateDepositsEnabled: true,
          reliabilityScoringEnabled: true,
          credentialVerificationEnabled: true,
        },
      })
    );

    const { projectId } = await createBaselineProject();
    const created = await createEstimateDepositHandler(req(customerId, 'customer', { projectId }));
    await captureEstimateDepositHandler(req(customerId, 'customer', { depositId: created.deposit.id }));
    await markEstimateAttendanceHandler(req(contractorId, 'contractor', { depositId: created.deposit.id, attendance: 'contractor_no_show' }));

    const deposit = (await db.collection('estimateDeposits').doc(created.deposit.id).get()).data();
    expect(deposit?.status).toBe('REFUNDED');

    const reliability = await getReliabilityScoreHandler(req(contractorId, 'contractor', {}));
    expect(typeof reliability.score?.score).toBe('number');
  });

  it('estimate deposit credit reduces funding hold amount', async () => {
    await adminSetConfigHandler(
      req(adminId, 'admin', {
        featureFlags: {
          estimateDepositsEnabled: true,
        },
      })
    );

    const createdProject = await createProjectHandler(
      req(customerId, 'customer', {
        category: 'plumbing',
        title: 'Deposit credit flow',
        description: 'Testing estimate credit before funding.',
        photos: [],
        municipality: 'San Juan',
        desiredTimeline: 'Within 5 days',
      })
    );
    const projectId = createdProject.project.id;
    const quoted = await submitQuoteHandler(
      req(contractorId, 'contractor', {
        projectId,
        priceCents: 100000,
        timelineDays: 2,
        scopeNotes: 'Test quote',
      })
    );
    await selectContractorHandler(req(customerId, 'customer', { projectId, quoteId: quoted.quote.id }));
    await acceptAgreementHandler(req(customerId, 'customer', { agreementId: projectId }));
    await acceptAgreementHandler(req(contractorId, 'contractor', { agreementId: projectId }));

    const created = await createEstimateDepositHandler(req(customerId, 'customer', { projectId }));
    await captureEstimateDepositHandler(req(customerId, 'customer', { depositId: created.deposit.id }));
    await applyEstimateDepositToJobHandler(req(customerId, 'customer', { projectId, depositId: created.deposit.id }));
    await fundHoldHandler(req(customerId, 'customer', { projectId }));

    const fundedProject = (await db.collection('projects').doc(projectId).get()).data();
    expect(fundedProject?.estimateDepositCreditCents).toBeGreaterThan(0);
    expect(fundedProject?.heldAmountCents).toBeLessThan(100000);
  });

  afterAll(async () => {
    await (db as any).terminate?.();
    await Promise.all(getApps().map((app) => deleteApp(app)));
  });
});
