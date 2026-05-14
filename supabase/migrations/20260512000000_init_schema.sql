-- Table: briefs
CREATE TABLE IF NOT EXISTS public.briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  summary text,
  goals text[],
  requested_features text[],
  ambiguities text[],
  follow_up_questions text[],
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'draft',
  share_id uuid
);

-- Table: uploads
CREATE TABLE IF NOT EXISTS public.uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id uuid REFERENCES public.briefs(id) ON DELETE CASCADE,
  type text,
  file_url text,
  created_at timestamp with time zone DEFAULT now()
);
