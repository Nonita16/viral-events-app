-- Migration: Make referral codes user-based instead of event-based
-- This allows users to have a single referral code for their profile, not tied to specific events

-- Step 1: Drop the old foreign key constraints and tables (if data needs to be preserved, export first)
DROP TABLE IF EXISTS referral_clicks CASCADE;
DROP TABLE IF EXISTS referral_registrations CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;

-- Step 2: Recreate referral_codes table (user-based, no event_id)
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for fast lookup by user
CREATE INDEX idx_referral_codes_created_by ON referral_codes(created_by);

-- Step 3: Recreate referral_clicks table (tracks anonymous user clicks)
CREATE TABLE referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  anon_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_referral_click UNIQUE (referral_code_id, anon_user_id)
);

-- Add index for analytics queries
CREATE INDEX idx_referral_clicks_referral_code_id ON referral_clicks(referral_code_id);
CREATE INDEX idx_referral_clicks_anon_user_id ON referral_clicks(anon_user_id);

-- Step 4: Recreate referral_registrations table (tracks when users sign up via referral)
-- No event_id needed - just track that user signed up via this referral code
CREATE TABLE referral_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_referral_registration UNIQUE (referral_code_id, user_id)
);

-- Add indexes for analytics
CREATE INDEX idx_referral_registrations_referral_code_id ON referral_registrations(referral_code_id);
CREATE INDEX idx_referral_registrations_user_id ON referral_registrations(user_id);

-- Add RLS policies
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_registrations ENABLE ROW LEVEL SECURITY;

-- Users can read their own referral codes
CREATE POLICY "Users can view their own referral codes"
  ON referral_codes FOR SELECT
  USING (auth.uid() = created_by);

-- Users can create their own referral codes
CREATE POLICY "Users can create their own referral codes"
  ON referral_codes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Anyone can read referral codes (needed for validation)
CREATE POLICY "Anyone can read referral codes for validation"
  ON referral_codes FOR SELECT
  USING (true);

-- Allow inserting clicks (anonymous users)
CREATE POLICY "Anyone can track clicks"
  ON referral_clicks FOR INSERT
  WITH CHECK (true);

-- Users can view clicks on their referral codes
CREATE POLICY "Users can view clicks on their codes"
  ON referral_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM referral_codes
      WHERE referral_codes.id = referral_clicks.referral_code_id
      AND referral_codes.created_by = auth.uid()
    )
  );

-- Allow inserting registrations
CREATE POLICY "Anyone can track registrations"
  ON referral_registrations FOR INSERT
  WITH CHECK (true);

-- Users can view registrations for their codes
CREATE POLICY "Users can view registrations for their codes"
  ON referral_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM referral_codes
      WHERE referral_codes.id = referral_registrations.referral_code_id
      AND referral_codes.created_by = auth.uid()
    )
  );
