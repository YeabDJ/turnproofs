# Airbnb CleanProof (SaaS Platform)

Welcome! This is a dedicated Next.js (App Router, Tailwind CSS, TypeScript) project built to solve the Airbnb cleaning validation problem.

## 🚀 Status & Handoff Info for the AI Agent:

1. **Database Set Up**: The postgres tables (`airbnb_hosts`, `airbnb_properties`, `airbnb_checklists`, `airbnb_cleaners`, `airbnb_reports`, `airbnb_report_tasks`) and storage bucket (`airbnb-proofs`) have already been successfully migrated and created in the remote Supabase database.
2. **Environment Variables**: The `.env.local` file has been copied from the main workspace and contains the database credentials.
3. **Task**: We need to build the CleanProof MVP. The roadmap and database specifications are detailed in [IMPLEMENTATION_PLAN.md](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/IMPLEMENTATION_PLAN.md).

## 🛠️ What to do next:
Start by reviewing the [IMPLEMENTATION_PLAN.md](file:///C:/Users/yeabi/Documents/airbnb-cleanproof/IMPLEMENTATION_PLAN.md) and building the API authentication (`src/app/api/airbnb/auth/route.ts`) and database client utilities.
