# Airbnb Cleaning Checklist Platform (CleanProof)

This plan outlines the architecture, database schema, API endpoints, and user interface for the **Airbnb Cleaning Checklist** system. This feature will enable short-term rental hosts to manage their properties, assign checklists, track cleaner completions, verify geo-location coordinates, and export proof-of-cleaning reports for Airbnb support.

## User Review Required

> [!IMPORTANT]
> - **Authentication Method**: We will use a low-friction **Email + 6-digit PIN** passwordless authentication scheme for hosts. When a new email is entered, it automatically signs up the host by setting a PIN. Existing hosts log in using their email and PIN.
> - **GPS Location Verification**: To ensure cleaners are actually at the property, we will request HTML5 Geolocation access (`navigator.geolocation`) upon starting and completing the cleaning. The coordinates (latitude and longitude) will be stored in the database and linked to Google Maps in the final report.
> - **Storage Bucket**: A new public storage bucket named `airbnb-proofs` will be created in Supabase to house the task validation photos.

## Database Migrations

The database schemas have already been executed on the remote Supabase instance. The tables created are:
1. `airbnb_hosts` (id, email, pin_code, business_name, created_at)
2. `airbnb_properties` (id, host_id, name, address, cover_image_url, latitude, longitude, created_at)
3. `airbnb_checklists` (id, property_id, task_name, requires_photo, sort_order, created_at)
4. `airbnb_cleaners` (id, host_id, name, phone, created_at)
5. `airbnb_reports` (id, property_id, cleaner_name, started_at, completed_at, start_latitude, start_longitude, end_latitude, end_longitude, notes, created_at)
6. `airbnb_report_tasks` (id, report_id, task_name, requires_photo, photo_url, completed, created_at)

The public storage bucket `airbnb-proofs` has also been created.

## Proposed Changes

### Backend API Routes

#### [NEW] [route.ts (Auth API)](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/src/app/api/airbnb/auth/route.ts)
Endpoint to handle Host login and registration via email & PIN. Sets a cookie `airbnb_host_token` on successful authentication.

#### [NEW] [route.ts (Properties API)](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/src/app/api/airbnb/properties/route.ts)
Handles GET, POST, and DELETE requests for host properties.

#### [NEW] [route.ts (Checklists API)](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/src/app/api/airbnb/checklists/route.ts)
Handles fetching, creating, updating, and deleting checklist tasks.

#### [NEW] [route.ts (Cleaners API)](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/src/app/api/airbnb/cleaners/route.ts)
Handles GET, POST, and DELETE requests for cleaners.

#### [NEW] [route.ts (Reports API)](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/src/app/api/airbnb/reports/route.ts)
Handles:
- `POST` submissions from cleaners (attaches timestamps, GPS locations, and uploaded photos).
- `GET` requests to retrieve reports history.

#### [NEW] [route.ts (Reports Detail API)](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/src/app/api/airbnb/reports/[reportId]/route.ts)
Handles GET details for a specific cleaning report by ID.

---

### Frontend Views

#### [NEW] [page.tsx (Airbnb Landing)](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/src/app/airbnb/page.tsx)
A premium marketing landing page for the "Airbnb Cleaning Checklist Tool" featuring a vibrant coral/dark theme, explaining features (quick checkboxes, geolocation, PDF downloads) with clean CTAs to access the Host Dashboard or launch the cleaner demo.

#### [NEW] [login/page.tsx (Host PIN Auth)](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/src/app/airbnb/login/page.tsx)
A sleek, single-page login using the same PIN keyboard styling as the master command center, requiring an email address and a 6-digit passcode.

#### [NEW] [dashboard/page.tsx (Host Panel)](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/src/app/airbnb/dashboard/page.tsx)
The central control center for Airbnb hosts. Let's hosts:
- Add and edit properties.
- View and copy the cleaner link for each property (`/airbnb/clean/[propertyId]`).
- Customize the checklist for each property.
- Manage cleaners.
- View historically submitted cleaning reports.

#### [NEW] [clean/[propertyId]/page.tsx (Cleaner Checkout)](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/src/app/airbnb/clean/[propertyId]/page.tsx)
Mobile-optimized portal for the cleaning staff:
- Zero login needed for cleaners. They just choose their name from a dropdown.
- Captures geolocation coordinates with permission.
- Displays check-list items (completed in under 3 minutes).
- Integrated camera button to take photo proof for tasks requiring images.
- Displays a clean success state when submitted.

#### [NEW] [report/[reportId]/page.tsx (Stunning PDF Report)](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/src/app/airbnb/report/[reportId]/page.tsx)
A dedicated, print-optimized cleaning verification certificate page:
- Beautiful header with timestamps (Start, Complete, Duration).
- Cleaner details and address.
- GPS validation panel showing coordinates, accuracy, and a dynamic Google Maps link.
- Table of checklist items showing verification status.
- Grid of uploaded photo proofs with high-res modals.
- **Download PDF** button trigger `window.print()` with CSS that styles it perfectly for letter-sized printed sheets.
