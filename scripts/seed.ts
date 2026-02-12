import { readFileSync } from 'fs';
import { join } from 'path';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'trustvibe-dev' });
}

const db = getFirestore();

function loadJson<T>(fileName: string): T {
  const path = join(process.cwd(), 'data', 'demo', fileName);
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

async function clearCollection(path: string): Promise<void> {
  const snap = await db.collection(path).get();
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function seedConfig(): Promise<void> {
  const now = new Date().toISOString();
  await db.collection('config').doc('platformFees').set({
    percentBps: 500,
    fixedFeeCents: 0,
    updatedAt: now,
    updatedBy: 'seed-script',
  });

  await db.collection('config').doc('holdPolicy').set({
    approvalWindowDays: 7,
    adminAttentionDays: 30,
    autoReleaseEnabled: true,
    updatedAt: now,
    updatedBy: 'seed-script',
  });

  await db.collection('config').doc('featureFlags').set({
    stripeConnectEnabled: false,
    estimateDepositsEnabled: true,
    milestonePaymentsEnabled: false,
    changeOrdersEnabled: false,
    credentialVerificationEnabled: true,
    schedulingEnabled: false,
    reliabilityScoringEnabled: true,
    subscriptionsEnabled: true,
    highTicketConciergeEnabled: true,
    recommendationsEnabled: false,
    growthEnabled: false,
    updatedAt: now,
    updatedBy: 'seed-script',
  });

  await db.collection('config').doc('platformFeesV2').set({
    schemaVersion: 2,
    tiers: [
      { id: 'small', minAmountCents: 0, maxAmountCents: 99999, percentBps: 900, fixedFeeCents: 0 },
      { id: 'standard', minAmountCents: 100000, maxAmountCents: 749999, percentBps: 700, fixedFeeCents: 0 },
      { id: 'high_ticket', minAmountCents: 750000, percentBps: 500, fixedFeeCents: 0 },
    ],
    updatedAt: now,
    updatedBy: 'seed-script',
  });

  await db.collection('config').doc('depositPolicies').set({
    schemaVersion: 1,
    rules: [
      { category: 'plumbing', amountCents: 2900, currency: 'USD', refundableOnContractorNoShow: true, creditToJobOnProceed: true },
      { category: 'electrical', amountCents: 3900, currency: 'USD', refundableOnContractorNoShow: true, creditToJobOnProceed: true },
      { category: 'painting', amountCents: 2900, currency: 'USD', refundableOnContractorNoShow: true, creditToJobOnProceed: true },
      { category: 'roofing', amountCents: 7900, currency: 'USD', refundableOnContractorNoShow: true, creditToJobOnProceed: true },
      { category: 'carpentry', amountCents: 3900, currency: 'USD', refundableOnContractorNoShow: true, creditToJobOnProceed: true },
      { category: 'hvac', amountCents: 5900, currency: 'USD', refundableOnContractorNoShow: true, creditToJobOnProceed: true },
      { category: 'landscaping', amountCents: 2900, currency: 'USD', refundableOnContractorNoShow: true, creditToJobOnProceed: true },
      { category: 'cleaning', amountCents: 2900, currency: 'USD', refundableOnContractorNoShow: true, creditToJobOnProceed: true },
      { category: 'general', amountCents: 3900, currency: 'USD', refundableOnContractorNoShow: true, creditToJobOnProceed: true },
    ],
    updatedAt: now,
    updatedBy: 'seed-script',
  });

  await db.collection('config').doc('subscriptionPlans').set({
    schemaVersion: 1,
    plans: [
      {
        id: 'contractor_pro',
        audience: 'contractor',
        name: 'Contractor Pro',
        monthlyPriceCents: 2900,
        annualPriceCents: 29900,
        featureCodes: ['priority_ranking', 'reduced_fees'],
        active: true,
      },
      {
        id: 'contractor_premium',
        audience: 'contractor',
        name: 'Contractor Premium',
        monthlyPriceCents: 6900,
        annualPriceCents: 69900,
        featureCodes: ['priority_ranking', 'concierge_access', 'reduced_fees'],
        active: true,
      },
      {
        id: 'property_manager_team',
        audience: 'property_manager',
        name: 'Property Manager Team',
        monthlyPriceCents: 9900,
        includedUnits: 10,
        overageUnitPriceCents: 500,
        featureCodes: ['consolidated_invoicing', 'multi_property_dashboard'],
        active: true,
      },
    ],
    updatedAt: now,
    updatedBy: 'seed-script',
  });

  await db.collection('config').doc('reliabilityWeights').set({
    schemaVersion: 1,
    showUpRateWeight: 0.3,
    responseTimeWeight: 0.2,
    disputeFrequencyWeight: 0.2,
    proofCompletenessWeight: 0.15,
    onTimeCompletionWeight: 0.15,
    autoReleaseThreshold: 80,
    largeJobThreshold: 75,
    highTicketThreshold: 85,
    updatedAt: now,
    updatedBy: 'seed-script',
  });

  await db.collection('config').doc('highTicketPolicy').set({
    schemaVersion: 1,
    thresholdCents: 500000,
    feeMode: 'intake_success',
    intakeFeeCents: 9900,
    successFeeBps: 300,
    contractorReferralFeeBps: 600,
    updatedAt: now,
    updatedBy: 'seed-script',
  });
}

async function run(): Promise<void> {
  console.log('Seeding TrustVibe demo data...');

  await clearCollection('users');
  await clearCollection('contractorProfiles');
  await clearCollection('customerProfiles');
  await clearCollection('projects');
  await clearCollection('agreements');
  await clearCollection('cases');
  await clearCollection('reviews');
  await clearCollection('estimateDeposits');
  await clearCollection('paymentAccounts');
  await clearCollection('subscriptions');
  await clearCollection('billingInvoices');
  await clearCollection('reliabilityScores');
  await clearCollection('highTicketCases');
  await clearCollection('credentialVerifications');

  const users = loadJson<any[]>('users.json');
  const contractors = loadJson<any[]>('contractors.json');
  const customers = loadJson<any[]>('customers.json');
  const projects = loadJson<any[]>('projects.json');
  const quotes = loadJson<any[]>('quotes.json');
  const messages = loadJson<any[]>('messages.json');
  const reviews = loadJson<any[]>('reviews.json');
  const timelines = loadJson<any[]>('escrowTimelines.json');
  const cases = loadJson<any[]>('cases.json');

  const userBatch = db.batch();
  users.forEach((u) => {
    userBatch.set(db.collection('users').doc(u.id), {
      ...u,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });
  await userBatch.commit();

  const contractorBatch = db.batch();
  contractors.forEach((c) => {
    contractorBatch.set(db.collection('contractorProfiles').doc(c.id), {
      userId: c.id,
      skills: c.skills,
      serviceMunicipalities: [c.municipality],
      serviceRadiusKm: 25,
      portfolio: [
        { imageUrl: 'https://example.com/portfolio1.jpg', caption: c.bioEn },
        { imageUrl: 'https://example.com/portfolio2.jpg', caption: c.bioEs },
      ],
      credentials: [
        { type: 'license', fileUrl: 'https://example.com/license.pdf', status: 'UNVERIFIED' },
      ],
      availability: {
        weekly: {
          monday: [{ start: '08:00', end: '17:00' }],
          tuesday: [{ start: '08:00', end: '17:00' }],
          wednesday: [{ start: '08:00', end: '17:00' }],
          thursday: [{ start: '08:00', end: '17:00' }],
          friday: [{ start: '08:00', end: '17:00' }],
        },
        blackoutDates: [],
      },
      ratingAvg: c.rating,
      reviewCount: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });
  await contractorBatch.commit();

  const reliabilityBatch = db.batch();
  contractors.forEach((c) => {
    const score = Math.round(Number(c.rating ?? 4) * 20);
    reliabilityBatch.set(db.collection('reliabilityScores').doc(c.id), {
      contractorId: c.id,
      score,
      metrics: {
        showUpRate: score,
        responseTimeScore: score,
        disputeScore: score,
        proofScore: score,
        onTimeScore: score,
      },
      counters: {
        appointmentsTotal: 10,
        appointmentsAttended: Math.max(1, Math.round((score / 100) * 10)),
        disputesTotal: 1,
        completionsTotal: 10,
        completionsOnTime: Math.max(1, Math.round((score / 100) * 10)),
        proofSubmissionsTotal: 10,
        proofSubmissionsComplete: Math.max(1, Math.round((score / 100) * 10)),
        responseSamples: 10,
        responseMedianMinutes: Math.max(5, 200 - score),
      },
      eligibility: {
        autoRelease: score >= 80,
        largeJobs: score >= 75,
        highTicket: score >= 85,
      },
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'seed-script',
    });
  });
  await reliabilityBatch.commit();

  const customerBatch = db.batch();
  customers.forEach((c) => {
    customerBatch.set(db.collection('customerProfiles').doc(c.id), {
      userId: c.id,
      preferredMunicipality: c.municipality,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });
  await customerBatch.commit();

  for (const project of projects) {
    await db.collection('projects').doc(project.id).set({
      id: project.id,
      customerId: project.customerId,
      category: project.category,
      title: project.titleEn,
      description: `${project.descriptionEn} / ${project.descriptionEs}`,
      photos: [],
      municipality: project.municipality,
      desiredTimeline: project.desiredTimeline,
      budgetMinCents: project.budgetMinCents,
      budgetMaxCents: project.budgetMaxCents,
      escrowState: project.escrowState,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  for (const quote of quotes) {
    await db
      .collection('projects')
      .doc(quote.projectId)
      .collection('quotes')
      .doc(quote.id)
      .set({
        id: quote.id,
        projectId: quote.projectId,
        contractorId: quote.contractorId,
        priceCents: quote.priceCents,
        timelineDays: quote.timelineDays,
        scopeNotes: `${quote.scopeNotesEn} / ${quote.scopeNotesEs}`,
        status: quote.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
  }

  for (const message of messages) {
    await db
      .collection('messages')
      .doc(message.projectId)
      .collection('items')
      .doc(message.id)
      .set({
        id: message.id,
        senderId: message.senderId,
        body: `${message.bodyEn} / ${message.bodyEs}`,
        attachments: [],
        createdAt: message.createdAt,
      });
  }

  for (const review of reviews) {
    await db.collection('reviews').doc(review.id).set({
      ...review,
      feedback: `${review.feedbackEn} / ${review.feedbackEs}`,
      flagged: false,
      createdAt: new Date().toISOString(),
    });
  }

  for (const timeline of timelines) {
    for (const event of timeline.events) {
      await db
        .collection('ledgers')
        .doc(timeline.projectId)
        .collection('events')
        .add({
          id: `${timeline.id}-${event.state}`,
          projectId: timeline.projectId,
          type: 'HOLD_CREATED',
          actorId: 'seed-script',
          actorRole: 'admin',
          metadata: { state: event.state },
          createdAt: event.at,
        });
    }
  }

  for (const item of cases) {
    await db.collection('cases').doc(item.id).set({
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await seedConfig();
  console.log('Seed completed.');
}

void run();
