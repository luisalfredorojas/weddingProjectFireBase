# Wedding Website — Firebase + Google Sheets RSVP

## Overview
Single-page wedding site built with semantic HTML, modern CSS, and vanilla JavaScript. Firebase Hosting serves the static assets, Firestore stores RSVPs, Firebase Storage exposes the invitee list JSON, and Google Sheets records RSVPs through either an Apps Script Web App or a Firebase Cloud Function.

## Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Hosting, Firestore, and Storage enabled (Functions required if you choose Google Sheets Option B)
- Google account with permission to create Apps Script projects and/or Sheets API access

## Project Structure
See inline comments in each file and `/public/app.config.js` for customization points.

## Setup Steps
1. **Clone & install tools**
   ```bash
   git clone <repo-url>
   cd weddingProjectFireBase
   npm install -g firebase-tools
   ```

2. **Create Firebase project**
   - In the Firebase console, create or select a project.
   - Enable Hosting, Firestore (in native mode), and Storage. Enable Functions if using Option B.

3. **Add a web app & copy config**
   - In Project settings → General, add a Web app.
   - Copy the Firebase config and paste it into `public/app.config.js` replacing the `// TODO` placeholders. (Client-side config is expected for Firebase web apps.)
   - Optionally, create `.env` from `.env.sample` for local development helpers.

4. **Upload invitees JSON**
   - Open Firebase Storage → Files and create a folder `data`.
   - Upload `public/data/invitees.example.json` as `data/invitees.json` (overwrite the example names with your real guest list first).
   - Ensure Storage rules from `storage.rules` are published.

5. **Deploy security rules**
   ```bash
   firebase login
   firebase use <your-project-id>
   firebase deploy --only firestore:rules,storage:rules
   ```

6. **Google Sheets integration**

   ### Option A — Google Apps Script Web App (recommended)
   1. Create a new Google Sheet (or reuse an existing one). Name columns `Timestamp`, `Invitee`, `PlusOne`, `Attending`, `Allergies`.
   2. Open Extensions → Apps Script, replace contents with `apps-script/Code.gs`.
   3. Update `SHEET_ID` constant with the ID portion of your Sheet URL.
   4. Deploy → New deployment → Web app. Configure:
      - **Execute as:** Me
      - **Who has access:** Anyone with the link (or limit to your Google Workspace domain).
   5. Authorize and copy the Web App URL.
   6. Paste the URL into `sheetsIntegration.appsScriptUrl` in `public/app.config.js`.

   ### Option B — Firebase Cloud Function + Google Sheets API
   1. In Google Cloud console, enable the Sheets API for your Firebase project.
   2. In Firebase console → Build → Functions, ensure Blaze plan (required for external API) or check your quota.
   3. Set the Sheet ID as functions config:
      ```bash
      firebase functions:config:set sheets.id="<YOUR_SHEET_ID>"
      ```
   4. Install dependencies and deploy functions:
      ```bash
      cd functions
      npm install
      cd ..
      firebase deploy --only functions
      ```
   5. Copy the HTTPS trigger URL from the Functions dashboard and paste into `sheetsIntegration.cloudFunctionUrl`.
   6. Set `sheetsIntegration.mode = 'cloudFunction'` in `public/app.config.js`.

7. **Local preview**
   ```bash
   firebase emulators:start --only hosting
   ```
   Open the provided localhost URL in your browser. Note: Firestore/Storage calls go to production unless you configure emulators.

8. **Deploy Hosting**
   ```bash
   firebase deploy --only hosting
   ```
   For Option B, include `--only hosting,functions` when ready.

9. **Post-deploy checklist**
   - Visit `https://<project-id>.web.app` and submit a test RSVP.
   - Verify Firestore `rsvps` collection records the entry.
   - Confirm Google Sheet appended the new row.

## Configuration Reference
- `public/app.config.js`: Firebase config, Sheets integration mode/URLs, and invitee storage path.
- `public/modules/rsvp.js`: Handles Firestore writes, Sheets POST, offline queue.
- `public/modules/storageLoader.js`: Fetches invitees list from Firebase Storage and caches it.

## Assets & Performance Notes
- Replace placeholder images/video in `public/assets/` with optimized media (WebP/JPG, compressed MP4). Keep file names or update references in `index.html`.
- Consider running `npx firebase deploy --only hosting` with `firebase deploy --only hosting --message "Your message"` for release notes.
- For best Lighthouse scores, precompress assets (gzip/brotli) and consider using responsive image sizes.

## Troubleshooting
- **CORS errors with Apps Script**: Ensure the deployed Web App allows access for “Anyone with the link” or adjust allowed origins inside `Code.gs`.
- **Invitees dropdown empty**: Confirm Storage rules published and `data/invitees.json` exists. Check browser console for signed URL errors.
- **Firestore permission denied**: Publish `firestore.rules` and verify project ID in `.firebaserc`.
- **Sheets API quota**: For Function option, monitor Google Cloud logs and set retries/backoff if needed.
- **Offline RSVPs queued**: Items stored in `localStorage` under `wedding:rsvpQueue`. When the page regains connectivity, queued entries automatically retry.

## Contributing
- Follow semantic HTML and accessibility guidelines.
- Keep CSS modular and respect existing variables.

