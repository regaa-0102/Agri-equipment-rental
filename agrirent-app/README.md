# AgriRent

### Agricultural Equipment Rental Platform

AgriRent is a college/demo project that connects farmers with agricultural equipment owners. Farmers can discover equipment, compare listings, and arrange rentals, while owners can list and manage their machinery. The platform also includes booking management, notifications, and administrative tools.

## 1. Project Overview

AgriRent provides a web marketplace for agricultural equipment rental. Farmers can browse listings by category, search and filter equipment, view details and locations, and create rental bookings. Equipment owners can publish listings and respond to booking requests. Role-specific dashboards support day-to-day booking and account management.

The current catalog includes 18 sample equipment listings. The application is intended for demonstration and academic use, not as a production rental or payment service.

## 2. Key Features

### Farmer

- Register or sign in with email and password.
- Request an email one-time password (OTP) when email delivery is configured.
- Sign in with Google when Google OAuth is configured.
- Browse equipment by category and open listing details.
- Search, filter, and sort listings by available criteria such as location, price, availability, and rating.
- Explore nearby equipment using location-aware results and an interactive map.
- Use the AgriMatch equipment recommendation and acreage calculator.
- Select rental dates and create a booking.
- View booking history, status, and tracking information in **My Bookings**.
- Receive a booking invoice by email when email delivery is configured.
- Receive a booking confirmation SMS when Twilio and a registered phone number are available.
- Rate equipment and optionally leave a written review after an eligible booking is completed.
- View notifications and dashboard summaries.
- Use the interface in English or Tamil and switch between light and dark themes.

### Equipment Owner

- Register or sign in as an equipment owner.
- Add equipment listings with a photo, description, category, location, and rental details.
- View and manage owned equipment, including editing or removing listings.
- Review relevant booking requests and notifications from the owner dashboard.

### Admin

- Sign in with the admin role; an administrator can be bootstrapped using server-side environment variables.
- View dashboard statistics and manage users and equipment listings.
- Review bookings in **Escrow & Bookings Audit** and inspect their booking and escrow statuses.
- Change supported booking statuses, including marking eligible past bookings as **Completed**.
- Suspend or reactivate user accounts from the admin dashboard.

## 3. Booking Flow

1. A farmer selects an equipment listing and chooses booking dates.
2. AgriRent saves the booking and its booking details.
3. An invoice is generated from the persisted booking data.
4. The server attempts to email the invoice to the farmer.
5. The server attempts to send a booking confirmation SMS to the farmer's registered phone number.
6. The farmer can view the booking and its status in **My Bookings**.
7. Once the booking is eligible and marked completed, the farmer can submit an equipment rating.

Email and SMS are external delivery attempts: a provider failure does not invalidate a booking that has already been persisted. Admins can mark eligible past bookings as completed.

## 4. Authentication

AgriRent supports:

- Email and password authentication.
- Email OTP authentication when the email provider is configured.
- Google OAuth sign-in when OAuth is configured.
- Role-based access for **Farmer**, **Equipment Owner**, and **Admin** accounts.

Google OAuth, email OTP, and administrator bootstrap require server-side configuration. Development/test role-switch support is controlled by a server environment flag and should not be enabled for a public deployment.

## 5. Equipment Categories

The current catalog uses these six category labels:

- Tractor
- Harvester
- Ploughing & Tilling
- Seeding
- Sprayers & Drones
- Water Pump

There are 18 seeded equipment listings across the catalog. Owners can add additional listings through the application.

## 6. Ratings and Reviews

Farmers can review equipment only after an eligible booking has been completed. A rating is required and must be between 1 and 5 stars; the written review is optional. The server prevents a farmer from submitting more than one review for the same booking. Equipment details display the rating summary and reviews when available.

## 7. SMS Notifications

Booking confirmation SMS messages are sent through Twilio to the phone number on the farmer's account. The booking interface masks the phone number in its confirmation message. Twilio credentials and sender configuration belong in local/server environment variables; do not put them in source control. An SMS delivery failure does not fail the booking.

## 8. Email and Invoices

AgriRent generates an invoice PDF using persisted booking information and attempts to email it to the farmer's registered email address through Resend. Email delivery depends on server-side provider configuration. If email delivery fails or is not configured, the already-persisted booking remains valid.

Email OTP delivery also uses the configured email service.

## 9. Technology Stack

- **React 19** and **TypeScript** for the application UI and typed application code.
- **TanStack Start** with **Vite** for the full-stack web application and development server.
- **Tailwind CSS 4** for utility-based styling, alongside application styles.
- **Node.js server APIs** for authentication, listings, bookings, reviews, and provider integrations.
- **File-backed JSON storage** at `.workspace/agrirent-store.json` for the current application data.
- **Leaflet** and **OpenStreetMap** for the nearby-equipment map.
- **Google OAuth** for optional Google sign-in.
- **Resend** for optional OTP and booking-invoice email delivery.
- **Twilio** for optional booking-confirmation SMS.

A MySQL connection helper and schema are present in the repository, but the current server storage implementation persists application data in the local JSON store.

## 10. Project Structure

```text
agrirent-app/
├── database/
│   └── schema.sql
├── public/
│   └── equipment/
├── src/
│   ├── components/   # Shared UI, maps, equipment cards, and booking widgets
│   ├── context/      # Authentication, language, and theme contexts
│   ├── data/         # Catalog and translation data
│   ├── lib/          # API client, catalog, booking, and shared helpers
│   ├── routes/       # TanStack Start page routes
│   ├── screens/      # Farmer, owner, and admin application screens
│   └── server/       # API handlers, authentication, SMS, and storage
├── .env.example      # Environment-variable names and placeholders
├── package.json
└── vite.config.ts
```

## 11. Local Setup

1. Clone the repository and enter the application directory:

   ```sh
   git clone https://github.com/regaa-0102/Agri-equipment-rental.git
   cd Agri-equipment-rental/agrirent-app
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a local `.env` file and configure the server variables needed for the integrations you want to test. The core app can run without external email, SMS, or Google OAuth credentials; those features require their respective provider configuration.
4. Start the development server:

   ```sh
   npm run dev
   ```

5. Open the local URL shown by Vite in your browser.

The existing Lovable project connection can also be used for editor-based development; local changes can be made and pushed through the connected Git repository.

## 12. Environment Variables

The following are variable **names only**. Set real values locally or in the server environment; never add credentials to this README.

```dotenv
# Optional MySQL connection helper (the current application store is file-backed JSON)
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# Optional stable signing key and administrator bootstrap
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=

# Google OAuth sign-in
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Optional development/test role-switch flag
GOOGLE_TEST_ROLE_SWITCH=

# Resend email delivery for OTP and booking invoices
RESEND_API_KEY=
AUTH_EMAIL_FROM=

# Twilio booking SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

Keep `.env` local and never commit credentials. Only configure provider variables for integrations you intend to use. Use the Google role-switch flag only in an appropriate development/test environment.

## 13. Demo Flow

1. Register or sign in as a Farmer.
2. Browse the equipment catalog.
3. Select an equipment listing and view its details.
4. Choose dates and create a booking.
5. Check the booking confirmation, invoice email, and SMS attempt (email/SMS delivery requires provider configuration).
6. Sign in with an Admin account.
7. Open **Escrow & Bookings Audit** and mark an eligible past booking as **Completed**.
8. Return to the Farmer account.
9. Open **My Bookings**.
10. Rate the completed equipment and optionally add a review.

## 14. Security Notes

- Keep secrets in local or server-side environment variables.
- Do not commit `.env` or share provider credentials.
- Access is role-based for farmers, equipment owners, and admins.
- Google OAuth, Resend, and Twilio credentials are used by server-side code and should remain server-side.
- Email and SMS provider failures do not incorrectly fail bookings that have already been persisted.

## 15. Project Status

AgriRent is a college/demo-ready agricultural equipment rental platform with marketplace browsing, role-based accounts, booking workflows, owner tools, admin oversight, and optional email/SMS integrations. It is a demonstration project and is not represented as production-ready.

## 16. License

No license file or license terms are currently included in the repository.
