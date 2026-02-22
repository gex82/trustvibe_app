const { readFileSync } = require('fs');
const { join } = require('path');

type DemoItem = Record<string, unknown> & { id?: string };

type Finding = {
  file: string;
  id: string;
  field: string;
  issue: string;
  sample: string;
};

const repoRoot = join(__dirname, '..');

const files = [
  { name: 'projects.json', fields: ['titleEs', 'descriptionEs'] },
  { name: 'messages.json', fields: ['bodyEs'] },
  { name: 'reviews.json', fields: ['feedbackEs'] },
] as const;

const englishTokenPatterns: RegExp[] = [
  /\bproject\b/i,
  /\bservice\b/i,
  /\bbathroom\b/i,
  /\bkitchen\b/i,
  /\bdriveway\b/i,
  /\bpainting\b/i,
  /\belectrical\b/i,
  /\broofing\b/i,
  /\bcarpentry\b/i,
  /\bhvac\b/i,
  /\blandscaping\b/i,
  /\bcleaning\b/i,
];

const validEscrowStates = new Set([
  'OPEN_FOR_QUOTES',
  'CONTRACTOR_SELECTED',
  'AGREEMENT_ACCEPTED',
  'FUNDED_HELD',
  'COMPLETION_REQUESTED',
  'RELEASED_PAID',
  'ISSUE_RAISED_HOLD',
  'EXECUTED_RELEASE_FULL',
  'EXECUTED_RELEASE_PARTIAL',
  'EXECUTED_REFUND_FULL',
  'EXECUTED_REFUND_PARTIAL',
]);

function loadJson<T>(fileName: string): T {
  const filePath = join(repoRoot, 'data', 'demo', fileName);
  return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
}

function toSample(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.length > 120 ? `${value.slice(0, 117)}...` : value;
}

function findLocalizationLeaks(items: DemoItem[], fileName: string, fields: readonly string[]): Finding[] {
  const findings: Finding[] = [];

  for (const item of items) {
    const id = String(item.id ?? 'unknown-id');
    for (const field of fields) {
      const value = item[field];
      if (typeof value !== 'string' || value.trim().length === 0) {
        continue;
      }

      for (const pattern of englishTokenPatterns) {
        if (pattern.test(value)) {
          findings.push({
            file: fileName,
            id,
            field,
            issue: `English token detected (${pattern.source})`,
            sample: toSample(value),
          });
          break;
        }
      }
    }
  }

  return findings;
}

function findInvalidEscrowStates(projects: DemoItem[]): Finding[] {
  const findings: Finding[] = [];

  for (const item of projects) {
    const escrowState = String(item.escrowState ?? '');
    if (!validEscrowStates.has(escrowState)) {
      findings.push({
        file: 'projects.json',
        id: String(item.id ?? 'unknown-id'),
        field: 'escrowState',
        issue: 'Invalid escrow state for demo localization path',
        sample: escrowState,
      });
    }
  }

  return findings;
}

function main(): void {
  const findings: Finding[] = [];

  for (const file of files) {
    const items = loadJson<DemoItem[]>(file.name);
    findings.push(...findLocalizationLeaks(items, file.name, file.fields));
    if (file.name === 'projects.json') {
      findings.push(...findInvalidEscrowStates(items));
    }
  }

  if (!findings.length) {
    console.log('Localization leak check passed.');
    process.exit(0);
  }

  console.error(`Localization leak check failed with ${findings.length} finding(s).`);
  findings.forEach((finding, index) => {
    console.error(
      `${index + 1}. ${finding.file} :: ${finding.id} :: ${finding.field} :: ${finding.issue} :: ${finding.sample}`
    );
  });
  process.exit(1);
}

main();
