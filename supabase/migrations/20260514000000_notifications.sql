-- Migration: Add notifications table and client_feedback column
-- Created at: 2026-05-14

-- Add client_feedback column to briefs if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'briefs' AND COLUMN_NAME = 'client_feedback') THEN
    ALTER TABLE public.briefs ADD COLUMN client_feedback text;
  END IF;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id uuid REFERENCES public.briefs(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'approval', 'feedback', etc.
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);
