-- Add performance indexes for commonly queried fields

-- Index for querying referral registrations by user_id
CREATE INDEX IF NOT EXISTS idx_referral_registrations_user_id
ON referral_registrations(user_id);

-- Index for querying invites by recipient email
CREATE INDEX IF NOT EXISTS idx_invites_sent_to_email
ON invites(sent_to_email);

-- Index for querying invites by sender
CREATE INDEX IF NOT EXISTS idx_invites_sent_by
ON invites(sent_by);

-- Index for querying RSVPs by user_id
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id
ON rsvps(user_id);

-- Index for composite queries on referral_clicks by anon_user_id
CREATE INDEX IF NOT EXISTS idx_referral_clicks_anon_user_id
ON referral_clicks(anon_user_id);
