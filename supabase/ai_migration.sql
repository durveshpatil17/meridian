-- Migration: AI-driven ingestion support

-- 1. Add columns to existing tables
ALTER TABLE deliverables 
  ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  ADD COLUMN estimated_effort_minutes integer,
  ADD COLUMN source text DEFAULT 'manual' CHECK (source IN ('manual','ai_upload','ai_email','ai_chat')),
  ADD COLUMN source_document_id uuid;

ALTER TABLE pipeline_items 
  ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  ADD COLUMN source text DEFAULT 'manual' CHECK (source IN ('manual','ai_upload','ai_email','ai_chat')),
  ADD COLUMN source_document_id uuid;

ALTER TABLE content_pieces 
  ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  ADD COLUMN source text DEFAULT 'manual' CHECK (source IN ('manual','ai_upload','ai_email','ai_chat')),
  ADD COLUMN source_document_id uuid;

-- 2. Create documents table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  storage_path text NOT NULL,
  source_type text CHECK (source_type IN ('upload','email')),
  email_from text,
  email_subject text,
  mime_type text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','extracted','confirmed','rejected','failed')),
  raw_extraction jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);

-- 3. Create extraction_items table
CREATE TABLE extraction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  target_table text CHECK (target_table IN ('deliverables','pipeline_items','content_pieces')),
  extracted_data jsonb NOT NULL,
  confidence text CHECK (confidence IN ('high','medium','low')),
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','edited','rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE extraction_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own extraction items" ON extraction_items
  FOR ALL USING (auth.uid() = user_id);

-- 4. Create storage bucket and policy
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users access own folder" ON storage.objects
  FOR ALL USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 5. Add performance indexes
CREATE INDEX idx_documents_user_status ON documents(user_id, status);
CREATE INDEX idx_extraction_items_user_status ON extraction_items(user_id, status);
