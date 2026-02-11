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
    milestonePaymentsEnabled: false,
    changeOrdersEnabled: false,
    credentialVerificationEnabled: false,
    schedulingEnabled: false,
    recommendationsEnabled: false,
    growthEnabled: false,
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
