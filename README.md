# M.R Sales Manager

A mobile-friendly sales and profit tracking app built with HTML, CSS and JavaScript.

## Features
- Customer name and mobile number
- Sales amount, product purchase cost and automatic profit calculation
- Sale date and optional note
- Dashboard totals for sales, purchase cost and profit
- Search by customer name or phone; filter by month
- Edit and delete individual records
- Export records to CSV
- Responsive desktop and mobile layout
- Capacitor Android project workflow

## Data storage
Records are saved in the browser's local storage on the current device. They are not automatically synced between devices or browsers. Export a CSV backup regularly if you need a separate copy.

## Use as a website
Enable GitHub Pages for the repository using the `main` branch and `/(root)` folder. The root `index.html` opens the app in `/www/`.

## Build Android APK
1. Open the **Actions** tab.
2. Select **Build Android APK** and choose **Run workflow**, or push a commit to `main`.
3. Wait for the workflow to finish successfully.
4. Open the workflow run and download the `MR-Sales-Manager-debug-apk` artifact.
5. Extract the ZIP to get `app-debug.apk`.

The debug APK is for testing. A Play Store release requires a signed release build and a private signing key.
