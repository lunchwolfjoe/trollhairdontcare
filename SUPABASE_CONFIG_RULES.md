# Supabase Configuration Rules for TrollHairDontCare

## Credential Management

1. **Do Not Change Connection Details**
   - The Supabase URL and Anon Key in `.env.local` must not be changed without team approval
   - These credentials are specifically configured for the TrollHairDontCare project

2. **Project ID: `ysljpqtpbpugekhrdocq`**
   - This is the official Supabase project for this application
   - All database migrations should target this project

## Version Control

1. **Environment Files**
   - `.env.local` contains the actual credentials but is git-ignored
   - `.env.example` shows the format without real credentials
   - Never commit actual credentials to version control

2. **Local Development**
   - If you need a separate Supabase instance for testing, create a `.env.local.dev` file
   - Use `npm run dev:local` to run with your own credentials (custom script to be added)

## Testing Connections

1. **Verification Tools**
   - Use the `/test-connection` route in the app to test the connection
   - Or run `verify-supabase.bat` from the command line

2. **Authentication Testing**
   - When testing auth flows, use temporary test emails
   - Do not create test accounts with real emails

## Row-Level Security (RLS)

1. **Policy Changes**
   - All RLS policy changes must be approved and documented
   - Use migration scripts for any RLS changes

## API Access

1. **Service Role**
   - The service role key must never be used in client-side code
   - Only use the anon key for client applications

2. **JWT Handling**
   - Handle JWTs securely, never store in localStorage without encryption

## Database Schema

1. **Migrations**
   - All schema changes must be captured in migration files
   - Run migrations through the Supabase dashboard or CLI

## Storage Buckets

1. **Bucket Creation**
   - New storage buckets must follow the existing naming convention
   - All buckets must have appropriate RLS policies

---

**Last Updated:** April 9, 2024
**Approved By:** TrollHairDontCare Team 