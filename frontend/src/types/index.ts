export type UserRole = 'creator' | 'reviewer' | 'admin';

export type ContentStatus = 'draft' | 'in_review' | 'approved' | 'scheduled' | 'rejected';

export type Platform = 'linkedin' | 'instagram' | 'x' | 'youtube' | 'blog';

export type Language = 'English' | 'Hindi' | 'Marathi';

export type Tone = 'Professional' | 'Thought-Leadership' | 'Casual' | 'Persuasive' | 'Bold' | 'Educational';

export type NavTab = 
  | 'overview'
  | 'ai-studio'
  | 'library'
  | 'approvals'
  | 'campaigns'
  | 'calendar'
  | 'brand-voice'
  | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  membersCount: number;
}

export interface BrandProfile {
  id: string;
  workspaceId: string;
  name: string;
  primaryTone: Tone;
  audience: string;
  preferredTerms: string[];
  prohibitedPhrases: string[];
  styleGuidelines: string;
}

export interface Comment {
  id: string;
  contentId: string;
  authorName: string;
  authorRole: UserRole;
  body: string;
  createdAt: string;
}

export interface WorkflowEvent {
  id: string;
  contentId: string;
  actorName: string;
  actorRole: UserRole;
  fromStatus: ContentStatus;
  toStatus: ContentStatus;
  feedback?: string;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  workspaceId: string;
  title: string;
  body: string;
  platform: Platform;
  format: string;
  language: Language;
  tone: Tone;
  status: ContentStatus;
  authorName: string;
  authorRole: UserRole;
  campaignId?: string;
  campaignName?: string;
  scheduledAt?: string;
  version: number;
  comments: Comment[];
  history: WorkflowEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  workspaceId: string;
  name: string;
  objective: string;
  targetAudience: string;
  startDate: string;
  endDate: string;
  itemCount: number;
  status: 'planning' | 'active' | 'completed';
}

export interface QualityCheck {
  readabilityScore: number; // 0 - 100
  charCount: number;
  maxChars?: number;
  hasCallToAction: boolean;
  prohibitedTermsFound: string[];
  toneAlignment: 'High' | 'Medium' | 'Low';
  advisoryNotes: string[];
}
