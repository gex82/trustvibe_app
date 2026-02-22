import type {
  EarningsRecord,
  EstimateDepositView,
  ProjectStatus,
  QuoteStatus,
} from "./index";

export interface LocalizedLineItemSource {
  label: string;
  labelEn?: string;
  labelEs?: string;
  amount: number;
}

export interface LocalizedQuoteSource {
  id: string;
  projectId: string;
  contractorId: string;
  amount: number;
  breakdown: LocalizedLineItemSource[];
  timeline: string;
  timelineEn?: string;
  timelineEs?: string;
  notes: string;
  notesEn?: string;
  notesEs?: string;
  status: QuoteStatus;
  submittedAt: string;
}

export interface LocalizedProjectSource {
  id: string;
  customerId: string;
  contractorId?: string;
  title: string;
  titleEn?: string;
  titleEs?: string;
  description: string;
  descriptionEn?: string;
  descriptionEs?: string;
  category: string;
  categoryEn?: string;
  categoryEs?: string;
  location: string;
  locationEn?: string;
  locationEs?: string;
  budget: string;
  budgetEn?: string;
  budgetEs?: string;
  timeline: string;
  timelineEn?: string;
  timelineEs?: string;
  status: ProjectStatus;
  createdAt: string;
  photos: string[];
  quotes: LocalizedQuoteSource[];
  acceptedQuoteId?: string;
  escrowAmount?: number;
  trustvibeFee?: number;
  estimateDeposit?: EstimateDepositView;
  completionPhotos?: string[];
  completionNote?: string;
  completionNoteEn?: string;
  completionNoteEs?: string;
}

export interface LocalizedMessageSource {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  textEn?: string;
  textEs?: string;
  timestamp: string;
  read: boolean;
}

export interface LocalizedThreadSource {
  id: string;
  participants: string[];
  projectId: string;
  projectTitle: string;
  projectTitleEn?: string;
  projectTitleEs?: string;
  messages: LocalizedMessageSource[];
}

export interface LocalizedReviewSource {
  id: string;
  projectId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  tags: string[];
  tagsEn?: string[];
  tagsEs?: string[];
  text: string;
  textEn?: string;
  textEs?: string;
  createdAt: string;
  fromName: string;
}

export interface LocalizedContractorSource {
  id: string;
  businessName: string;
  businessNameEn?: string;
  businessNameEs?: string;
  name: string;
  nameEn?: string;
  nameEs?: string;
  bio?: string;
  bioEn?: string;
  bioEs?: string;
  specialty?: string[];
  specialtyEn?: string[];
  specialtyEs?: string[];
  badges?: string[];
  badgesEn?: string[];
  badgesEs?: string[];
}

export interface LocalizedEarningsSource extends EarningsRecord {
  projectTitleEn?: string;
  projectTitleEs?: string;
}
