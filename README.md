 Email Authorization via Google Sheets

This application implements email-based authorization using a whitelist stored in a Google Sheet. Access to the schedule and booking functionality is restricted to users whose emails are listed in the "Users" tab with an "Active" status.

## Setup Instructions

### 1. Google Sheet Setup

Create a new Google Sheet with the following tabs:

#### "Users" Tab

| Column | Header | Description |
|--------|--------|-------------|
| A | Email | User email address (lowercase) |
| B | Name | Full name of the user |
| C | Status | `active` or `inactive` |
| D | Role | `user` or `admin` |

Example rows:
```
Email              | Name           | Status  | Role
user@example.com   | John Doe       | active  | user
admin@example.com  | Admin User     | active  | admin
```

#### "Bookings_RU", "Bookings_UA", "Bookings_DE" Tabs

These tabs store booking records. The script creates them automatically on first use.

#### "YearSchedule_RU", "YearSchedule_UA", "YearSchedule_DE" Tabs

These tabs store the yearly schedule. The script creates them automatically on first use.

### 2. Google Apps Script Setup

1. Open the Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Replace the contents of `Code.gs` with the code from `google_script.txt`.
4. Save the project.

### 3. Deploy as Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Select **Web app** as the type.
3. Set **Execute as** to "Me".
4. Set **Who has access** to "Anyone" (required for public access).
5. Click **Deploy**.
6. Copy the Web App URL (it will look like `https://script.google.com/macros/s/AKfycb.../exec`).

### 4. Configure the Frontend

In `app.js`, update the `GOOGLE_SCRIPT_URL` constant with your deployed Web App URL:

```javascript
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

### 5. Deploy to Vercel

1. Install the Vercel CLI: `npm i -g vercel`
2. In the project root, run `vercel`.
3. Follow the prompts to deploy.
4. After deployment, the app URL will be provided (e.g., `https://your-project.vercel.app`).

## How Authorization Works

1. When a user opens the application, an **Auth Modal** appears if they are not authenticated.
2. The user enters their email address and clicks **Войти** (Login).
3. The frontend sends a `GET` request to the Google Apps Script with `action=checkAuth&email=...`.
4. The script reads the "Users" tab and checks if the email exists with `Status = "active"`.
5. If valid, the user data is saved to `localStorage` and the schedule is displayed.
6. If invalid, an error message is shown.
7. The user can click **Выйти** (Logout) to clear the session and return to the auth modal.

## Security Notes

- The API key (`jw_144000`) is embedded in the frontend code. This is acceptable for a public-facing schedule app but should be rotated if you need stronger security.
- The `checkAuth` endpoint does not require the API key (it is a public check). If you want to require it, add the key check to `handleCheckAuth`.
- Only users with `Status = "active"` in 
