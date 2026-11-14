# M.R CARROM

A mobile-friendly carrom game starter project packaged with Capacitor for Android APK builds.

## Included
- Responsive carrom board and game interface
- Offline single-player vs a basic computer opponent
- Local two-player mode on the same device
- Touch and pointer striker aiming
- Capacitor Android wrapper
- GitHub Actions workflow for a debug APK build

## Current status
This is an early playable prototype, not a finished commercial-grade carrom simulation. Online multiplayer is not connected yet. Real online play needs a realtime backend, player accounts, room matchmaking, synchronized game state, disconnect handling, and server-side validation. Physics and scoring are simplified and need further testing.

## Build an Android APK
1. Open the **Actions** tab in this repository.
2. Select **Build Android APK** and choose **Run workflow**, or push a commit to the `main` branch.
3. Wait for the workflow to finish successfully.
4. Open the workflow run and download the `M-R-CARROM-debug-apk` artifact.
5. Extract the artifact ZIP to get `app-debug.apk`.

The debug APK is for testing. A Play Store release requires a signed release build and a private signing key.
