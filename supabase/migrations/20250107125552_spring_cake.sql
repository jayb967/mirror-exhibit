/*
# Support Requests and Email Campaigns Schema

1. New Tables
  - support_requests
    - id (serial primary key)
    - user_id (references auth.users)
    - subject (text)
    - message (text) 
    - status (text)
    - created_at (timestamptz)
    - updated_at (timestamptz)

  - email_campaigns
    - id (serial primary key)
    - subject (text)
    - content (text)
    - sent_to (jsonb) - store recipient info
    - sent_at (timestamptz)
    - created_at (timestamptz)
    - updated_at (timestamptz)

2. Security
  - Enable RLS
  - Add policies for authenticated users
*/

-- Create support_requests table
CREATE TABLE IF NOT EXISTS support_requests (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id SERIAL PRIMARY KEY,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_to JSONB DEFAULT '[]'::jsonb,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for support_requests
CREATE POLICY "Users can view their own support requests" ON support_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create support requests" ON support_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all support requests" ON support_requests
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can update support requests" ON support_requests
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for email_campaigns
CREATE POLICY "Admin can view email campaigns" ON email_campaigns
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can create email campaigns" ON email_campaigns
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update email campaigns" ON email_campaigns
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_requests_user ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON email_campaigns(sent_at);

-- Add triggers for updated_at
CREATE TRIGGER update_support_requests_updated_at
    BEFORE UPDATE ON support_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();