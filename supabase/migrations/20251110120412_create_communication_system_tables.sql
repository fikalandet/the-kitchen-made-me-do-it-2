/*
  # Communication System Tables

  1. New Tables
    - `message_threads` - Conversation threads
    - `thread_messages` - Messages in threads
    - `auto_message_templates` - Automated templates
    - `chef_notifications` - Chef notifications
    - `canned_replies` - Quick replies

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_a_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  party_b_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'customer_request',
  order_id uuid,
  status text NOT NULL DEFAULT 'unread',
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own threads"
  ON message_threads FOR SELECT
  TO authenticated
  USING (auth.uid() = party_a_id OR auth.uid() = party_b_id);

CREATE POLICY "Users can insert threads"
  ON message_threads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = party_a_id OR auth.uid() = party_b_id);

CREATE POLICY "Users can update their threads"
  ON message_threads FOR UPDATE
  TO authenticated
  USING (auth.uid() = party_a_id OR auth.uid() = party_b_id)
  WITH CHECK (auth.uid() = party_a_id OR auth.uid() = party_b_id);

CREATE TABLE IF NOT EXISTS thread_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES message_threads(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'general',
  channel text DEFAULT 'in-app',
  delivery_status text DEFAULT 'sent',
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE thread_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view thread messages"
  ON thread_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = thread_messages.thread_id
      AND (message_threads.party_a_id = auth.uid() OR message_threads.party_b_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert thread messages"
  ON thread_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM message_threads
      WHERE message_threads.id = thread_messages.thread_id
      AND (message_threads.party_a_id = auth.uid() OR message_threads.party_b_id = auth.uid())
    )
  );

CREATE TABLE IF NOT EXISTS auto_message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kitchen_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  trigger text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  channels text[] DEFAULT ARRAY['in-app'],
  delay_minutes integer DEFAULT 0,
  enabled boolean DEFAULT true,
  locale text DEFAULT 'sv',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE auto_message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can manage their templates"
  ON auto_message_templates FOR ALL
  TO authenticated
  USING (auth.uid() = kitchen_id)
  WITH CHECK (auth.uid() = kitchen_id);

CREATE TABLE IF NOT EXISTS chef_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chef_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON chef_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON chef_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS canned_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kitchen_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  locale text DEFAULT 'sv',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE canned_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can manage their canned replies"
  ON canned_replies FOR ALL
  TO authenticated
  USING (auth.uid() = kitchen_id)
  WITH CHECK (auth.uid() = kitchen_id);

CREATE INDEX IF NOT EXISTS idx_message_threads_parties ON message_threads(party_a_id, party_b_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_status ON message_threads(status);
CREATE INDEX IF NOT EXISTS idx_thread_messages_thread ON thread_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chef_notifications_user ON chef_notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_auto_templates_kitchen ON auto_message_templates(kitchen_id);
