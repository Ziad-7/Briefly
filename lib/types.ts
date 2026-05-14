export interface Brief {
  id: string;
  title?: string;
  summary?: string;
  goals?: string[];
  requested_features?: string[];
  ambiguities?: string[];
  follow_up_questions?: string[];
  status?: string;
  created_at?: string;
  share_id?: string;
  client_name?: string;
  raw_input?: string;
  file_references?: any[];
  is_pinned?: boolean;
  complexity_estimate?: string;
  complexity_reasoning?: string;
  client_feedback?: string;
}

export interface Upload {
  id: string;
  brief_id: string;
  type?: string;
  file_url?: string;
  created_at?: string;
}
