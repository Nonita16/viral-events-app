-- Add unique constraints to prevent duplicate referral registrations and clicks

-- Prevent duplicate registrations for the same user and referral code
ALTER TABLE referral_registrations
ADD CONSTRAINT unique_referral_registration
UNIQUE (referral_code_id, user_id);

-- Prevent duplicate click tracking for the same anonymous user and referral code
ALTER TABLE referral_clicks
ADD CONSTRAINT unique_referral_click
UNIQUE (referral_code_id, anon_user_id);

-- Add unique constraint to prevent duplicate invites to the same email for the same event
ALTER TABLE invites
ADD CONSTRAINT unique_invite_per_email_per_event
UNIQUE (event_id, sent_to_email);
