import type { EstimateDeposit } from "@trustvibe/shared";

export type UserRole = "customer" | "contractor" | "admin";

export type ProjectStatus =
  | "draft"
  | "open"
  | "funded"
  | "in_progress"
  | "complete_requested"
  | "completed"
  | "disputed";

export type QuoteStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  avatarUrl: string;
  phone?: string;
  location?: string;
  memberSince: string;
  verified: boolean;
}

export interface Contractor extends User {
  role: "contractor";
  businessName: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  completedJobs: number;
  bio: string;
  portfolioImages: string[];
  licenseNumber?: string;
  insuranceVerified: boolean;
  responseTime: string;
  badges: string[];
  hourlyRate?: number;
  reliabilityScore?: number;
}

export interface LineItem {
  label: string;
  amount: number;
}

export interface Quote {
  id: string;
  projectId: string;
  contractorId: string;
  amount: number;
  breakdown: LineItem[];
  timeline: string;
  notes: string;
  status: QuoteStatus;
  submittedAt: string;
}

export interface Project {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: string;
  timeline: string;
  status: ProjectStatus;
  createdAt: string;
  photos: string[];
  quotes: Quote[];
  acceptedQuoteId?: string;
  escrowAmount?: number;
  trustvibeFee?: number;
  estimateDeposit?: EstimateDepositView;
  completionPhotos?: string[];
  completionNote?: string;
}

export type EstimateDepositView = Pick<
  EstimateDeposit,
  | "id"
  | "projectId"
  | "customerId"
  | "contractorId"
  | "amountCents"
  | "status"
  | "createdAt"
  | "updatedAt"
>;

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface MessageThread {
  id: string;
  participants: string[];
  projectId: string;
  projectTitle: string;
  messages: Message[];
}

export interface Review {
  id: string;
  projectId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  tags: string[];
  text: string;
  createdAt: string;
  fromName: string;
}

export interface EarningsRecord {
  id: string;
  projectId: string;
  projectTitle: string;
  customerName: string;
  amount: number;
  fee: number;
  netPaid: number;
  paidAt: string;
  status: "paid" | "pending" | "held";
}

export type DemoUser = User | Contractor;
export type DemoQuote = Quote;
export type DemoProject = Project;
export type DemoThread = MessageThread;

export interface DemoAdminStats {
  totalProjects: number;
  escrowProjects: number;
  openCases: number;
  verifiedContractors: number;
  totalEscrowCents: number;
}
