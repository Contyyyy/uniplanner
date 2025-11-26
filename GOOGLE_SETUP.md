# Google OAuth Setup Guide

To enable Google Login for UniPlan, you need to set up a Google Cloud Project and obtain OAuth credentials.

## Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top bar and select **"New Project"**.
3. Name your project (e.g., "UniPlan Dev") and click **"Create"**.
4. Select your new project from the notification or the project dropdown.

## Step 2: Configure OAuth Consent Screen
1. In the left sidebar, go to **"APIs & Services" > "OAuth consent screen"**.
2. Select **"External"** for User Type (unless you have a Google Workspace organization) and click **"Create"**.
3. Fill in the required fields:
   - **App Name**: UniPlan
   - **User Support Email**: Your email
   - **Developer Contact Information**: Your email
4. Click **"Save and Continue"**.
5. On the **Scopes** screen, click **"Add or Remove Scopes"**.
6. Select `.../auth/userinfo.email` and `.../auth/userinfo.profile`.
7. Click **"Update"**, then **"Save and Continue"**.
8. On the **Test Users** screen, add your own Google email address so you can test the login.
9. Click **"Save and Continue"**.

## Step 3: Create Credentials
1. In the left sidebar, go to **"Credentials"**.
2. Click **"Create Credentials"** at the top and select **"OAuth client ID"**.
3. For **Application type**, select **"Web application"**.
4. Name it "UniPlan Local".
5. Under **"Authorized redirect URIs"**, click **"Add URI"** and enter:
   ```
   http://localhost:5173/login/google/callback
   ```
6. Click **"Create"**.

## Step 4: Update Environment Variables
1. You will see a popup with your **Client ID** and **Client Secret**.
2. Copy these values.
3. Open your `.env` file in the project root (create one if it doesn't exist, copying from `.env.example`).
4. Add the values:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```
5. Restart your development server (`npm run dev`) to load the new environment variables.

## Troubleshooting
- **Error 400: redirect_uri_mismatch**: Ensure the URI in the Google Console exactly matches `http://localhost:5173/login/google/callback`.
- **Error 403: access_denied**: Make sure your email is added to the "Test Users" list if the app is in "Testing" mode.
