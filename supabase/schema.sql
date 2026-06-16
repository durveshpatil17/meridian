-- Enable RLS on all tables by default (will be explicitly done per table)

-- 1. courses
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own courses" ON courses FOR ALL USING (user_id = auth.uid());

-- 2. deliverables
CREATE TABLE deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text CHECK (type IN ('assignment','project','presentation','quiz','midterm','endterm','group_project')),
  due_date date,
  status text DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','submitted')),
  weight numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own deliverables" ON deliverables FOR ALL USING (user_id = auth.uid());

-- 3. pipeline_items
CREATE TABLE pipeline_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company text NOT NULL,
  role text,
  type text CHECK (type IN ('internship','placement','case_competition')),
  stage text DEFAULT 'applied' CHECK (stage IN ('applied','shortlisted','interview_r1','interview_r2','offer','closed')),
  next_action text,
  next_action_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE pipeline_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own pipeline items" ON pipeline_items FOR ALL USING (user_id = auth.uid());

-- 4. content_pieces
CREATE TABLE content_pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text CHECK (type IN ('book_chapter','article','blog_post','linkedin_post')),
  stage text DEFAULT 'idea' CHECK (stage IN ('idea','outline','draft','review','scheduled','published')),
  platform text,
  target_date date,
  series text,
  word_count integer,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own content pieces" ON content_pieces FOR ALL USING (user_id = auth.uid());

-- 5. chat_messages
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own chat messages" ON chat_messages FOR ALL USING (user_id = auth.uid());


-- Seed Function
CREATE OR REPLACE FUNCTION create_seed_data(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_course_id uuid;
  v_c7_id uuid;
  v_c2_id uuid;
  v_c5_id uuid;
BEGIN
  -- Insert 13 courses
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'Business Statistics', 'BS');
  
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'Marketing', 'MKT') RETURNING id INTO v_c2_id;
  
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'Financial Statement Analysis', 'FSA');
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'Principles & Practices of Management', 'PPM');
  
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'Research Methodology', 'RM') RETURNING id INTO v_c5_id;
  
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'Domain Study BFSI', 'BFSI');
  
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'BPM', 'BPM') RETURNING id INTO v_c7_id;
  
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'Information Risk Management', 'IRM');
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'Requirements Management', 'REQ');
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'IT Infrastructure Essentials', 'ITIE');
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'Generative AI Tools', 'GENAI');
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'Digital Technology Transformation', 'DTT');
  INSERT INTO courses (user_id, name, code) VALUES (p_user_id, 'SAP S/4HANA BPI', 'SAP');

  -- Insert Deliverables
  INSERT INTO deliverables (user_id, course_id, title, type, due_date, status, weight, notes)
  VALUES 
    (p_user_id, v_c7_id, 'BPM assignment', 'assignment', CURRENT_DATE + INTERVAL '4 days', 'in_progress', 10, ''),
    (p_user_id, v_c2_id, 'Marketing presentation', 'presentation', CURRENT_DATE + INTERVAL '7 days', 'not_started', 20, ''),
    (p_user_id, v_c5_id, 'Research Methodology project', 'project', CURRENT_DATE + INTERVAL '10 days', 'not_started', 30, '');

  -- Insert Pipeline
  INSERT INTO pipeline_items (user_id, company, role, type, stage, next_action, next_action_date, notes)
  VALUES 
    (p_user_id, 'Deloitte', 'Business Analyst', 'internship', 'shortlisted', 'prep case study', CURRENT_DATE + INTERVAL '3 days', ''),
    (p_user_id, 'McKinsey', 'Strategy Analyst', 'placement', 'applied', 'follow up email', CURRENT_DATE + INTERVAL '5 days', '');

  -- Insert Content
  INSERT INTO content_pieces (user_id, title, type, stage, platform, target_date, series, word_count, notes)
  VALUES 
    (p_user_id, 'AI Governance in Indian Banking', 'article', 'draft', 'LinkedIn', CURRENT_DATE + INTERVAL '7 days', '', 0, ''),
    (p_user_id, 'The Governor Model — Part 1', 'linkedin_post', 'idea', 'LinkedIn', CURRENT_DATE + INTERVAL '14 days', '', 0, '');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
