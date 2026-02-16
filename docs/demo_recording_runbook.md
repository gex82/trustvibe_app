# iPad Demo Recording Runbook

Last updated: 2026-02-13

## Goal

Produce one-take customer and contractor recordings with deterministic state, clear UI, and no interruptions.

## Device setup (before each take)

1. Enable landscape orientation lock OFF (record in portrait).
2. Enable Do Not Disturb / Focus mode.
3. Disable notification previews and close background apps.
4. Set brightness to 70-80%.
5. Confirm iPad and dev machine are on the same Wi-Fi network.
6. Open Expo Go only after bootstrap is complete.

## Environment reset

1. Stop any running Expo/emulator processes.
2. In terminal window A run `npm run bootstrap:demo`.
3. In terminal window B start app with `npm run dev -w @trustvibe/mobile`.
4. Verify no blocking red screen errors in Expo logs.

## Recording order

1. Record customer flow first: `docs/demo_script_customer.md`.
2. Re-run `npm run bootstrap:demo` to reset deterministic state.
3. Record contractor flow second: `docs/demo_script_contractor.md`.

## If state drifted during a take

1. Stop recording.
2. Force close Expo Go on iPad.
3. Re-run `npm run bootstrap:demo`.
4. Relaunch Expo app and restart from step 1 of the script.

## Final pre-record checklist

1. Language switcher visible on Home and Profile.
2. Home screen has visible quick `Log out` action in the top row.
3. Profile screen has visible red `Log out` button.
4. Demo credentials match `docs/demo_credentials.md`.
5. Upload actions work and complete with no blocking error.
6. End state after logout is role-selection screen.
