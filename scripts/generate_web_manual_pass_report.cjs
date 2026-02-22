#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--runDir') {
      args.runDir = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function parseChecklist(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split(/\r?\n/)
    .map((line) => line.match(/^- \[[ x]\] (.+)$/))
    .filter(Boolean)
    .map((match) => match[1].trim());
}

function collectTests(node, prefix = [], acc = []) {
  if (!node || typeof node !== 'object') {
    return acc;
  }

  const nextPrefix = node.title ? [...prefix, node.title] : prefix;

  if (Array.isArray(node.specs)) {
    for (const spec of node.specs) {
      const specPrefix = spec.title ? [...nextPrefix, spec.title] : nextPrefix;
      if (Array.isArray(spec.tests)) {
        for (const test of spec.tests) {
          const statuses = Array.isArray(test.results) ? test.results.map((r) => r.status) : [];
          const status = statuses.includes('passed') ? 'passed' : statuses.includes('failed') ? 'failed' : statuses[0] || 'unknown';
          acc.push({
            title: [...specPrefix, test.title].join(' > '),
            status,
          });
        }
      }
    }
  }

  if (Array.isArray(node.suites)) {
    for (const suite of node.suites) {
      collectTests(suite, nextPrefix, acc);
    }
  }

  return acc;
}

function hasPassingTest(tests, fragment) {
  return tests.some((test) => test.status === 'passed' && test.title.toLowerCase().includes(fragment.toLowerCase()));
}

function listEvidence(runDir, fragment) {
  const screenshotsDir = path.join(runDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    return [];
  }

  const files = fs.readdirSync(screenshotsDir);
  return files
    .filter((file) => file.toLowerCase().includes(fragment.toLowerCase()))
    .slice(0, 3)
    .map((file) => path.relative(process.cwd(), path.join(screenshotsDir, file)).replace(/\\/g, '/'));
}

function statusEntry(status, reason, evidence = []) {
  return {
    status,
    reason,
    evidence,
  };
}

function normalizeChannel(channel) {
  const raw = String(channel || '').toLowerCase().trim();
  if (raw === 'msedge' || raw === 'edge') {
    return 'edge';
  }
  if (raw === 'chrome' || raw === 'chromium' || raw === '') {
    return 'chrome';
  }
  return raw;
}

function mapChecklistItem(item, checks, meta, runDir) {
  const lower = item.toLowerCase();
  const channel = normalizeChannel(meta.playwrightChannel || meta.playwrightBrowserName || 'chromium');

  if (lower.startsWith('chrome:') || lower.startsWith('edge:')) {
    const targetChannel = lower.startsWith('edge:') ? 'edge' : 'chrome';
    if (channel !== targetChannel) {
      return statusEntry('N/A', `Validated in ${channel} run; ${targetChannel} assertions require ${targetChannel}-channel run.`, []);
    }

    if (lower.includes('customer login')) {
      return statusEntry(checks.quickLogout || checks.customerFlow ? 'PASS' : 'FAIL', 'Covered by dedicated quick logout test and scripted flows.', listEvidence(runDir, 'home-quick-logout'));
    }
    if (lower.includes('contractor login')) {
      return statusEntry(checks.contractorFlow ? 'PASS' : 'FAIL', 'Covered by contractor scripted browser flow.', listEvidence(runDir, 'contractor-'));
    }
    if (lower.includes('home activity row tap')) {
      return statusEntry(
        checks.homeActivityNavigation ? 'PASS' : 'FAIL',
        'Covered by deterministic home-activity navigation test.',
        listEvidence(runDir, 'home-activity-project-detail')
      );
    }
    if (lower.includes('search and recommendations')) {
      return statusEntry(checks.customerFlow ? 'PASS' : 'FAIL', 'Covered by customer scripted browser flow.', listEvidence(runDir, 'customer-'));
    }
    if (lower.includes('agreement/deposit transparency')) {
      return statusEntry(
        checks.agreementDepositTransparency ? 'PASS' : 'FAIL',
        'Covered by deterministic agreement/deposit transparency test.',
        listEvidence(runDir, 'agreement-deposit-transparency')
      );
    }
  }

  if (lower.includes('physical iphone')) {
    return statusEntry('N/A', 'Physical-device-only validation.', listEvidence(runDir, 'customer-home-initial'));
  }

  if (lower.includes('run `npm run bootstrap:demo`')) {
    return statusEntry(meta.bootstrapSuccess ? 'PASS' : 'FAIL', 'Validated by web pass runner bootstrap step.', listEvidence(runDir, 'customer-home-initial'));
  }

  if (lower.includes('check_local_demo_env.ps1')) {
    return statusEntry(meta.envCheckSuccess ? 'PASS' : 'FAIL', 'Validated by web pass runner environment check.', listEvidence(runDir, 'admin-users'));
  }

  if (lower.includes('emulators listening')) {
    return statusEntry(meta.emulatorsReady ? 'PASS' : 'FAIL', 'Validated during bootstrap and environment checks.', listEvidence(runDir, 'customer-home-initial'));
  }

  if (lower.includes('admin app launches')) {
    return statusEntry(meta.adminReachable ? 'PASS' : 'FAIL', 'Admin URL reachable before automation started.', listEvidence(runDir, 'admin-users'));
  }

  if (lower.includes('mobile app launches on physical iphone')) {
    return statusEntry('N/A', 'Physical-device-only validation.', listEvidence(runDir, 'customer-home-initial'));
  }

  if (lower.includes('register flow works')) {
    return statusEntry(checks.authReliability ? 'PASS' : 'FAIL', 'Covered by manual QA auth reliability test.', listEvidence(runDir, 'register-success-home'));
  }

  if (lower.includes('login flow works for seeded personas')) {
    return statusEntry(checks.customerFlow && checks.contractorFlow ? 'PASS' : 'FAIL', 'Covered by customer and contractor scripted flows.', listEvidence(runDir, 'customer-home-initial'));
  }

  if (lower.includes('back navigation is available')) {
    return statusEntry(checks.authReliability ? 'PASS' : 'FAIL', 'Covered by login <-> register navigation path in auth reliability test.', listEvidence(runDir, 'invalid-credentials-error'));
  }

  if (lower.includes('forgot password action')) {
    return statusEntry(checks.authReliability ? 'PASS' : 'FAIL', 'Covered by reset-password trigger in auth reliability test.', listEvidence(runDir, 'invalid-credentials-error'));
  }

  if (lower.includes('home quick logout')) {
    return statusEntry(checks.quickLogout || checks.customerFlow || checks.contractorFlow ? 'PASS' : 'FAIL', 'Covered by dedicated quick logout test and scripted flows.', listEvidence(runDir, 'home-quick-logout'));
  }

  if (lower.includes('profile logout')) {
    return statusEntry(checks.authReliability ? 'PASS' : 'FAIL', 'Covered by auth reliability test after successful registration.', listEvidence(runDir, 'register-success-home'));
  }

  if (lower.includes('role is hydrated') || lower.includes('feature flags are loaded')) {
    return statusEntry(checks.customerFlow && checks.contractorFlow ? 'PASS' : 'FAIL', 'Validated during authenticated navigation and feature-dependent screens.', listEvidence(runDir, 'customer-project-detail'));
  }

  if (lower.includes('when a feature is disabled')) {
    return statusEntry('N/A', 'Disabled-feature toggle behavior is not exercised in this web smoke subset.', listEvidence(runDir, 'admin-config'));
  }

  if (lower.includes('customer demo path') || lower.includes('contractor demo path')) {
    return statusEntry('N/A', 'Section header row.', []);
  }

  if (lower.includes('search screen') || lower.includes('contractor profile') || lower.includes('home screen') || lower.includes('project detail screen') || lower.includes('completion review path') || lower.includes('resolution submission') || lower.includes('recommendations')) {
    return statusEntry(checks.customerFlow ? 'PASS' : 'FAIL', 'Covered by customer scripted browser flow.', listEvidence(runDir, 'customer-'));
  }

  if (lower.includes('project list/detail') || lower.includes('messages screen') || lower.includes('profile edit') || lower.includes('documents screen') || lower.includes('earnings/history/settings')) {
    return statusEntry(checks.contractorFlow ? 'PASS' : 'FAIL', 'Covered by contractor scripted browser flow.', listEvidence(runDir, 'contractor-'));
  }

  if (lower.includes('avatar upload') || lower.includes('document upload')) {
    return statusEntry(checks.contractorFlow && checks.customerFlow ? 'PASS' : 'FAIL', 'Validated by upload steps in scripted flows.', listEvidence(runDir, 'uploaded'));
  }

  if (lower.includes('completion proof upload') || lower.includes('resolution file upload')) {
    return statusEntry('N/A', 'Not directly reachable in current web scripted route; covered in mobile-device manual pass.', listEvidence(runDir, 'contractor-project-detail'));
  }

  if (lower.includes('admin login works') || lower.includes('feature flags are visible and editable') || lower.includes('credential verification status') || lower.includes('dispute/case outcome')) {
    return statusEntry(checks.adminSmoke ? 'PASS' : 'FAIL', 'Covered by admin smoke browser flow.', listEvidence(runDir, 'admin-'));
  }

  if (lower.includes('emulator offline')) {
    return statusEntry('N/A', 'Out-of-scope for deterministic online web pass.', listEvidence(runDir, 'invalid-credentials-error'));
  }

  if (lower.includes('auth failures show user-safe messages')) {
    return statusEntry(checks.authReliability ? 'PASS' : 'FAIL', 'Covered by invalid credential auth scenario.', listEvidence(runDir, 'invalid-credentials-error'));
  }

  if (lower.includes('disabled-feature actions do not surface')) {
    return statusEntry('N/A', 'Disabled-feature gating is validated in separate feature-flag runs, not this smoke subset.', listEvidence(runDir, 'admin-config'));
  }

  if (lower.includes('register password fields expose eye toggle')) {
    return statusEntry(checks.authReliability ? 'PASS' : 'FAIL', 'Covered by auth reliability register password visibility assertions.', listEvidence(runDir, 'register-success-home'));
  }

  if (lower.includes('terms link opens scrollable modal')) {
    return statusEntry(checks.authReliability ? 'PASS' : 'FAIL', 'Covered by auth reliability terms modal language-toggle path.', listEvidence(runDir, 'register-success-home'));
  }

  if (lower.includes('register submit is blocked until modal')) {
    return statusEntry(checks.authReliability ? 'PASS' : 'FAIL', 'Covered by auth reliability submit-disabled-until-accept assertions.', listEvidence(runDir, 'register-success-home'));
  }

  if (lower.includes('project detail `select contractor` routes')) {
    return statusEntry(
      checks.agreementDepositTransparency ? 'PASS' : 'FAIL',
      'Covered by deterministic agreement/deposit transparency test (select-contractor to quotes compare).',
      listEvidence(runDir, 'agreement-deposit-transparency')
    );
  }

  if (lower.includes('quote cards show contractor identity')) {
    return statusEntry(
      checks.agreementDepositTransparency ? 'PASS' : 'FAIL',
      'Covered by deterministic agreement/deposit transparency test quote-card assertions.',
      listEvidence(runDir, 'agreement-deposit-transparency')
    );
  }

  if (lower.includes('agreement acceptance happens from `agreementreview`')) {
    return statusEntry(
      checks.agreementDepositTransparency ? 'PASS' : 'FAIL',
      'Covered by deterministic agreement/deposit transparency test agreement-review assertions.',
      listEvidence(runDir, 'agreement-deposit-transparency')
    );
  }

  if (lower.includes('project detail contractor identity shows friendly name')) {
    return statusEntry(
      checks.agreementDepositTransparency ? 'PASS' : 'FAIL',
      'Covered by deterministic agreement/deposit transparency test workflow contractor display assertions.',
      listEvidence(runDir, 'agreement-deposit-transparency')
    );
  }

  if (lower.includes('workflow and advanced actions display contextual status/error guidance')) {
    return statusEntry(
      checks.agreementDepositTransparency ? 'PASS' : 'FAIL',
      'Covered by deterministic agreement/deposit transparency test (workflow card + advanced actions visibility).',
      listEvidence(runDir, 'agreement-deposit-transparency')
    );
  }

  if (lower.includes('home recent activity rows are tappable and open the correct project detail')) {
    return statusEntry(
      checks.homeActivityNavigation ? 'PASS' : 'FAIL',
      'Covered by deterministic home-activity navigation test.',
      listEvidence(runDir, 'home-activity-project-detail')
    );
  }

  if (lower.includes('test:unit') || lower.includes('test:integration')) {
    return statusEntry('N/A', 'Not executed by this web-only pass runner.', []);
  }

  return statusEntry('N/A', 'No deterministic browser-equivalent assertion mapped in this run.', []);
}

function buildMarkdown(runDir, results, summary) {
  const now = new Date();
  const runRelative = path.relative(process.cwd(), runDir).replace(/\\/g, '/');
  const lines = [];

  lines.push('# Web Manual Pass Report');
  lines.push('');
  lines.push(`Date: ${now.toISOString().slice(0, 10)}`);
  lines.push(`Run directory: \`${runRelative}\``);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- PASS: ${summary.pass}`);
  lines.push(`- FAIL: ${summary.fail}`);
  lines.push(`- N/A: ${summary.na}`);
  lines.push('');
  lines.push('## Checklist Results');
  lines.push('');
  lines.push('| Checklist item | Status | Evidence | Notes |');
  lines.push('| --- | --- | --- | --- |');

  for (const row of results) {
    const evidence = row.evidence.length
      ? row.evidence.map((item) => `\`${item}\``).join('<br/>')
      : '-';
    lines.push(`| ${row.item} | ${row.status} | ${evidence} | ${row.reason} |`);
  }

  lines.push('');
  lines.push('## Automation Tests');
  lines.push('');
  lines.push('- `customer flow: web click path`');
  lines.push('- `contractor flow: web click path`');
  lines.push('- `admin smoke: config toggles and tables`');
  lines.push('- `manual qa: auth reliability checks`');
  lines.push('- `manual qa: home quick logout is visible and works`');
  lines.push('');

  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv);
  const runDir = args.runDir
    ? path.resolve(args.runDir)
    : process.env.DEMO_PASS_DIR
    ? path.resolve(process.env.DEMO_PASS_DIR)
    : path.resolve('artifacts', 'demo-pass', 'adhoc');

  const resultsJsonPath = path.join(runDir, 'results.json');
  const metaJsonPath = path.join(runDir, 'run-meta.json');
  const checklistPath = path.resolve('docs', 'manual_qa_checklist.md');

  if (!fs.existsSync(resultsJsonPath)) {
    console.error(`Missing Playwright results file: ${resultsJsonPath}`);
    process.exit(1);
  }

  const reportJson = readJson(resultsJsonPath, {});
  const meta = readJson(metaJsonPath, {}) || {};
  const tests = collectTests(reportJson, []);

  const checks = {
    customerFlow: hasPassingTest(tests, 'customer flow: web click path'),
    contractorFlow: hasPassingTest(tests, 'contractor flow: web click path'),
    adminSmoke: hasPassingTest(tests, 'admin smoke: config toggles and tables'),
    authReliability: hasPassingTest(tests, 'manual qa: auth reliability checks'),
    quickLogout: hasPassingTest(tests, 'manual qa: home quick logout is visible and works'),
    homeActivityNavigation: hasPassingTest(tests, 'manual qa: home activity row opens project detail'),
    agreementDepositTransparency: hasPassingTest(tests, 'manual qa: agreement and deposit transparency checkpoints'),
  };

  const checklistItems = parseChecklist(checklistPath);
  const mapped = checklistItems.map((item) => {
    const entry = mapChecklistItem(item, checks, meta, runDir);
    return {
      item,
      ...entry,
    };
  });

  const summary = mapped.reduce(
    (acc, row) => {
      if (row.status === 'PASS') acc.pass += 1;
      else if (row.status === 'FAIL') acc.fail += 1;
      else acc.na += 1;
      return acc;
    },
    { pass: 0, fail: 0, na: 0 }
  );

  const reportDate = new Date().toISOString().slice(0, 10);
  const docsReportPath = path.resolve('docs', `web_manual_pass_report_${reportDate}.md`);
  const runReportPath = path.join(runDir, `web_manual_pass_report_${reportDate}.md`);
  const checklistJsonPath = path.join(runDir, 'checklist_results.json');

  const markdown = buildMarkdown(runDir, mapped, summary);
  fs.writeFileSync(docsReportPath, markdown, 'utf8');
  fs.writeFileSync(runReportPath, markdown, 'utf8');
  fs.writeFileSync(
    checklistJsonPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        summary,
        checks,
        items: mapped,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(`Report written to ${docsReportPath}`);
  console.log(`Run copy written to ${runReportPath}`);
  console.log(`Checklist JSON written to ${checklistJsonPath}`);

  if (summary.fail > 0) {
    process.exit(1);
  }
}

main();
