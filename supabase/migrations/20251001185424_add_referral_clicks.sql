-- Create referral_clicks table for tracking link clicks
CREATE TABLE IF NOT EXISTS referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  anon_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_referral_clicks_referral_code_id ON referral_clicks(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_anon_user_id ON referral_clicks(anon_user_id);

-- Enable Row Level Security
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_clicks
-- Allow anyone to view clicks
CREATE POLICY "Anyone can view referral clicks" ON referral_clicks
  FOR SELECT USING (true);

-- Allow anyone (including anon users) to insert clicks
CREATE POLICY "Anyone can insert referral clicks" ON referral_clicks
  FOR INSERT WITH CHECK (true);
