export interface CommentItem {
  id: string;
  authorName?: string;
  content: string;
  createdAt: string; // ISO
  createdAtFormatted: string;
  likes?: number;
}

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
  authorName?: string;
  likes?: number;
  comments?: CommentItem[];
}

export type ActiveView = 'submit' | 'public_feed' | 'moderation' | 'passkey_settings';
export type CommentSortMode = 'latest' | 'hottest' | 'oldest';
