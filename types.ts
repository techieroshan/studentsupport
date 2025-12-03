
export enum UserRole {
  GUEST = 'GUEST',
  SEEKER = 'SEEKER',
  DONOR = 'DONOR',
  ADMIN = 'ADMIN'
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED'
}

export enum DietaryPreference {
  VEGETARIAN = 'Vegetarian',
  VEGAN = 'Vegan',
  HINDU_VEG = 'Hindu Veg (No Egg)',
  JAIN_VEG = 'Jain Veg (No Root Veg)',
  HALAL = 'Halal',
  KOSHER = 'Kosher',
  GLUTEN_FREE = 'Gluten Free',
  NUT_FREE = 'Nut Free',
  NO_OIL = 'No Oil',
  NONE = 'No Restrictions'
}

export enum MedicalPreference {
  NO_OIL = 'No Oil',
  NO_SUGAR = 'No Sugar',
  DAIRY_FREE = 'Dairy Free',
  LOW_SODIUM = 'Low Sodium',
  SOFT_FOOD = 'Soft Food Only',
  NONE = 'None'
}

export enum FulfillmentOption {
  PICKUP = 'Pickup (Student travels)',
  DELIVERY = 'Delivery (Donor drops off)',
  DINE_IN = 'Dine-in (Hosted by Donor)',
  MEET_UP = 'Meet Up (Public Spot)'
}

export enum Frequency {
  ONCE = 'One-time',
  WEEKLY = 'Weekly',
  DAILY = 'Daily',
  AS_NEEDED = 'As needed'
}

// --- Donor & Grant Types ---
export enum DonorCategory {
  GOVERNMENT = 'Government & Public Bodies',
  RELIGIOUS = 'Religious & Faith Organizations',
  NON_PROFIT = 'Non-Profits & Foundations',
  FAMILY_OFFICE = 'Family Offices',
  INDIVIDUAL = 'Individual Philanthropists',
  BUSINESS = 'Businesses & Corporate CSR',
  UNIVERSITY = 'University & Student Groups'
}

export enum DonorTier {
  PLATINUM = 'Platinum Partner', // 10k+ meals
  GOLD = 'Gold Partner',         // 5k-10k meals
  SILVER = 'Silver Partner',     // 1k-5k meals
  BRONZE = 'Bronze Partner',     // 100-1k meals
  COMMUNITY = 'Community Partner'
}

export interface Donor {
  id: string;
  name: string;
  category: DonorCategory;
  tier: DonorTier;
  logoUrl?: string; // Optional for individuals
  websiteUrl?: string;
  totalContributionDisplay: string; // e.g. "$25,000" or "₹15 Lakh"
  isAnonymous: boolean;
  anonymousName?: string; // "A Caring Family from Toronto"
  quote?: string;
  location?: string;
  since: string;
  isRecurring?: boolean;
}

export interface User {
  id: string;
  role: UserRole;
  avatarId: number;
  displayName: string; // Masked name
  email?: string; // Private
  emailVerified?: boolean; 
  phone?: string; // Private
  address?: string; // Private Full Address
  city: string;
  state: string;
  zip: string;
  country: string;
  radius: number;
  latitude?: number;
  longitude?: number;
  verificationStatus: VerificationStatus;
  verificationSteps?: {
    emailCheck: boolean;
    phoneCheck: boolean;
    identityCheck: boolean;
  };
  preferences?: DietaryPreference[];
  languages: string[]; // Spoken languages
  isAnonymous?: boolean;
  weeklyMealLimit?: number;
  currentWeeklyMeals?: number;
  donorCategory?: DonorCategory; 
}

export interface MealRequest {
  id: string;
  seekerId: string;
  seekerName: string;
  seekerAvatarId: number;
  seekerVerificationStatus: VerificationStatus;
  seekerLanguages: string[];
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude?: number;
  longitude?: number;
  dietaryNeeds: DietaryPreference[];
  medicalNeeds: MedicalPreference[];
  logistics: FulfillmentOption[];
  description: string;
  availability: string; // "Weekends", "Evenings", etc.
  frequency: Frequency;
  urgency: 'NORMAL' | 'URGENT'; 
  postedAt: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'FULFILLED' | 'PAUSED' | 'EXPIRED' | 'FLAGGED';
  completionPin?: string; // 4-digit PIN for verification
}

export interface MealOffer {
  id: string;
  donorId: string;
  donorName: string;
  donorAvatarId: number;
  donorVerificationStatus: VerificationStatus;
  donorLanguages: string[];
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude?: number;
  longitude?: number;
  description: string;
  imageUrl?: string;
  dietaryTags: DietaryPreference[];
  medicalTags?: MedicalPreference[];
  availableUntil: number;
  logistics: FulfillmentOption[];
  availability: string; // "Weekends", "Evenings", etc.
  frequency: Frequency;
  isAnonymous?: boolean; 
  status: 'AVAILABLE' | 'IN_PROGRESS' | 'CLAIMED' | 'FLAGGED';
  completionPin?: string; // 4-digit PIN for verification
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface StatsData {
  totalMeals: number;
  activeStudents: number;
  activeDonors: number;
  citiesCovered: number;
}

export interface Rating {
  id: string;
  fromUserId: string;
  reviewerName: string;
  reviewerAvatarId: number;
  reviewerRole: UserRole;
  reviewerLocation: string;
  toUserId: string; // 'system' or specific user
  transactionId: string;
  stars: number;
  comment: string;
  timestamp: number;
  isPublic?: boolean;
}

export interface FlaggedContent {
  id: string;
  itemId: string;
  itemType: 'REQUEST' | 'OFFER';
  reason: string;
  flaggedBy: string;
  timestamp: number;
  description: string;
}
