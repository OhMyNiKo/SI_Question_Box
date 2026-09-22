export interface QuestionItem {
  id: string;
  content: string;
  createdAt: string; // ISO timestamp
  createdAtFormatted: string; // "YYYY-MM-DD HH:mm:ss"
  reply?: string;
  repliedAt?: string;
  repliedAtFormatted?: string;
  repliedBy?: string;
  status: 'pending' | 'approved';
  category?: string;
}

export type ActiveView = 'submit' | 'public_feed' | 'moderation';
