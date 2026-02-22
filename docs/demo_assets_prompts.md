# Demo Asset Prompts (Reproducible)

Last updated: 2026-02-13

Use these prompts if you regenerate synthetic demo media externally.

## 1. Customer Avatar

Prompt:

`Create a professional headshot-style portrait illustration for a homeowner named Maria Rodriguez. Latina woman, approachable and confident, bright natural light, neutral background, mobile app profile avatar framing, high clarity, no logos, no text.`

Output target:

- `apps/mobile/assets/demo/avatars/maria_rodriguez.png`
- Square format, recommended 1024x1024.

## 2. Contractor Avatar

Prompt:

`Create a professional contractor profile portrait illustration for "Juan's Services". Latino male contractor, clean work shirt, friendly and trustworthy expression, subtle construction context, mobile profile avatar framing, no logos, no watermark, no text.`

Output target:

- `apps/mobile/assets/demo/avatars/juan_services.png`
- Square format, recommended 1024x1024.

## 3. Bathroom Remodel Gallery Set

Prompt template:

`Generate a realistic bathroom remodel progress photo in Puerto Rico residential style. Stage: {{stage}}. Bright interior lighting, modern fixtures, clean framing for mobile card gallery, no people, no logos, no text overlays.`

Stage variants:

- `Demolition complete`
- `Plumbing rough-in`
- `Tile and fixture installation`

Output targets:

- `apps/mobile/assets/demo/projects/bathroom_remodel_01.png`
- `apps/mobile/assets/demo/projects/bathroom_remodel_02.png`
- `apps/mobile/assets/demo/projects/bathroom_remodel_03.png`

## 4. Kitchen Remodel Gallery Set

Prompt template:

`Generate a realistic kitchen remodel progress photo in Puerto Rico residential style. Stage: {{stage}}. Clean, bright interior, no people, no logos, no text overlays.`

Stage variants:

- `Cabinet and backsplash replacement`
- `Countertops, lighting, and finishing`

Output targets:

- `apps/mobile/assets/demo/projects/kitchen_remodel_01.png`
- `apps/mobile/assets/demo/projects/kitchen_remodel_02.png`

## 5. Concrete Driveway Gallery

Prompt:

`Generate a realistic residential concrete driveway resurfacing photo in Puerto Rico style. Show clean finish, subtle curb line, daylight conditions, no people, no logos, no text overlays.`

Output target:

- `apps/mobile/assets/demo/projects/concrete_driveway_01.png`

## 6. Credential Mock Document

Prompt:

`Create a synthetic contractor license/certification document for demo use only. Include fictional organization references and a "Demo Only - Not Valid" footer. Professional layout on plain white background.`

Output target:

- `apps/mobile/assets/demo/documents/license_certificate_mock.txt` (or `.pdf` if replaced)

## 7. Insurance Mock Document

Prompt:

`Create a synthetic general liability insurance certificate for demo use only. Include fictional insurer name, coverage amount $1,000,000, and "Demo Only - Not Valid" footer.`

Output target:

- `apps/mobile/assets/demo/documents/general_liability_mock.txt` (or `.pdf` if replaced)

## 8. Resolution Mock Document

Prompt:

`Create a synthetic dispute resolution settlement document for a home remodeling escrow case. Include a short summary with partial release and customer refund outcome. Mark as demo-only.`

Output target:

- `apps/mobile/assets/demo/documents/resolution_settlement_mock.txt` (or `.pdf` if replaced)
