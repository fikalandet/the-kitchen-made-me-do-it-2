/*
  # Dokumentsystem för kockar

  1. Nya tabeller
    - `document_templates` - Global dokumentbank med templates
      - `id` (uuid, primary key)
      - `title` (text) - Dokumentets titel
      - `description` (text) - Kort beskrivning
      - `category` (text) - guideline, policy, guide, required_upload, other
      - `scope` (text) - all_chefs eller single_chef
      - `requires_upload` (boolean) - Om kocken måste ladda upp egen fil
      - `file_url` (text) - Länk till fil som admin laddat upp
      - `visible_in_kockakademin` (boolean) - Visa i Kockakademin
      - `visible_in_documents_tab` (boolean) - Visa i Dokument-fliken
      - `is_default_starter_pack` (boolean) - Ingår i startpaket för nya kockar
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `chef_documents` - Kockens dokument och kopplingar
      - `id` (uuid, primary key)
      - `chef_id` (uuid, foreign key) - Koppling till kock
      - `template_id` (uuid, foreign key) - Koppling till template (nullable)
      - `title` (text) - Dokumentets titel
      - `source` (text) - starter_pack, global_admin, chef_upload, admin_upload_single
      - `file_url` (text) - Faktisk fil för denna kock
      - `status` (text) - missing, uploaded, approved, expired
      - `notes` (text) - Interna admin-anteckningar
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Säkerhet
    - RLS aktiverat på båda tabeller
    - Policies för authenticated användare
*/

CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'other',
  scope text NOT NULL DEFAULT 'all_chefs',
  requires_upload boolean DEFAULT false,
  file_url text,
  visible_in_kockakademin boolean DEFAULT false,
  visible_in_documents_tab boolean DEFAULT true,
  is_default_starter_pack boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chef_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id uuid REFERENCES document_templates(id) ON DELETE SET NULL,
  title text NOT NULL,
  source text NOT NULL DEFAULT 'admin_upload_single',
  file_url text,
  status text DEFAULT 'missing',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view document templates"
  ON document_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert document templates"
  ON document_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update document templates"
  ON document_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete document templates"
  ON document_templates FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view chef documents"
  ON chef_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert chef documents"
  ON chef_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chef documents"
  ON chef_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete chef documents"
  ON chef_documents FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_chef_documents_chef_id ON chef_documents(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_documents_template_id ON chef_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_scope ON document_templates(scope);
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates(category);
