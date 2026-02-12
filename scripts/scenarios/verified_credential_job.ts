const { submitCredentialForVerificationHandler } = require('../../functions/src/http/productionHandlers');

function req(uid: string, role: 'customer' | 'contractor' | 'admin', data: unknown): any {
  return { auth: { uid, token: { role } }, data };
}

async function run(): Promise<void> {
  const contractorId = 'contractor-001';

  const verification = await submitCredentialForVerificationHandler(
    req(contractorId, 'contractor', {
      credentialType: 'daco_registration',
      identifier: 'DACO-PR-1001',
    })
  );

  console.log(
    JSON.stringify(
      {
        scenario: 'verified_credential_job',
        contractorId,
        verificationId: verification.verification.id,
        status: verification.verification.status,
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
