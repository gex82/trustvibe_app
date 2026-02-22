# Demo Assets Manifest

Last updated: 2026-02-13

## Asset Root

- `apps/mobile/assets/demo/`

## File-by-File Usage

| Asset File | Type | Intended Usage |
| --- | --- | --- |
| `apps/mobile/assets/demo/avatars/maria_rodriguez.png` | image | Customer persona visual in decks/docs and profile demos. |
| `apps/mobile/assets/demo/avatars/juan_services.png` | image | Contractor persona visual for verified profile surfaces. |
| `apps/mobile/assets/demo/avatars/contractor_mock_01.jpg` | image | Imported contractor avatar for mapped `contractor-001` demo identity. |
| `apps/mobile/assets/demo/avatars/contractor_mock_02.jpg` | image | Imported contractor avatar for mapped `contractor-013` demo identity. |
| `apps/mobile/assets/demo/avatars/contractor_mock_03.jpg` | image | Imported contractor avatar for mapped `contractor-012` demo identity. |
| `apps/mobile/assets/demo/avatars/contractor_mock_04.jpg` | image | Imported contractor avatar for mapped `contractor-011` demo identity. |
| `apps/mobile/assets/demo/projects/bathroom_remodel_01.png` | image | Featured project gallery image (milestone phase 1). |
| `apps/mobile/assets/demo/projects/bathroom_remodel_02.png` | image | Featured project gallery image (milestone phase 2). |
| `apps/mobile/assets/demo/projects/bathroom_remodel_03.png` | image | Featured project gallery image (milestone phase 3). |
| `apps/mobile/assets/demo/projects/kitchen_remodel_01.png` | image | Featured project gallery image (kitchen category). |
| `apps/mobile/assets/demo/projects/kitchen_remodel_02.png` | image | Featured project gallery image (kitchen finishing variant). |
| `apps/mobile/assets/demo/projects/concrete_driveway_01.png` | image | Featured project gallery image (concrete/driveway category). |
| `apps/mobile/assets/demo/projects/job_mock_01_before.jpg` | image | Imported before image for demo job set #1. |
| `apps/mobile/assets/demo/projects/job_mock_01_after.jpg` | image | Imported after image for demo job set #1. |
| `apps/mobile/assets/demo/projects/job_mock_02_before.jpg` | image | Imported before image for demo job set #2. |
| `apps/mobile/assets/demo/projects/job_mock_02_after.jpg` | image | Imported after image for demo job set #2. |
| `apps/mobile/assets/demo/projects/job_mock_03_before.jpg` | image | Imported before image for demo job set #3. |
| `apps/mobile/assets/demo/projects/job_mock_03_after.jpg` | image | Imported after image for demo job set #3. |
| `apps/mobile/assets/demo/projects/job_mock_04_showcase.jpg` | image | Imported showcase image for hero/project fallback. |
| `apps/mobile/assets/demo/documents/license_certificate_mock.txt` | document | Credential upload sample for contractor docs flow. |
| `apps/mobile/assets/demo/documents/general_liability_mock.txt` | document | Insurance upload sample for contractor docs flow. |
| `apps/mobile/assets/demo/documents/resolution_settlement_mock.txt` | document | Dispute/resolution upload sample in issue path demo. |
| `apps/mobile/assets/demo/branding/logo_variant_primary.png` | image | Demo slides or optional icon variant. |
| `apps/mobile/assets/demo/branding/splash_variant_light.png` | image | Demo splash variant for collateral/testing. |

## Code References

- `apps/mobile/src/assets/demoAssets.ts`
- `apps/mobile/src/screens/contractor/ContractorProfileScreen.tsx`
- `apps/mobile/src/screens/customer/SearchScreen.tsx`
- `apps/mobile/src/screens/shared/ProjectDetailScreen.tsx`
- `scripts/import_mock_demo_assets.ps1`
- `scripts/seed.ts`

## Notes

- All files are synthetic and safe for customer/contractor demos.
- Portfolio walkthrough now covers at least 3 categories: bathroom, kitchen, and concrete/driveway.
- Replace these with final brand/media assets before production launch work.
