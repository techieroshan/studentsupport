// Type definitions for API responses
import { User, MealRequest, MealOffer, Donor, Rating, FlaggedContent } from '../types';

export interface BackendUser {
  id: string;
  role: string;
  avatar_id: number;
  display_name: string;
  email?: string;
  email_verified: boolean;
  phone?: string;
  address?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  radius: number;
  latitude?: number;
  longitude?: number;
  verification_status: string;
  verification_steps?: {
    emailCheck: boolean;
    phoneCheck: boolean;
    identityCheck: boolean;
  };
  preferences?: string[];
  languages: string[];
  is_anonymous?: boolean;
  weekly_meal_limit?: number;
  current_weekly_meals: number;
  donor_category?: string;
}

export interface BackendRequest {
  id: string;
  seeker_id: string;
  seeker_name: string;
  seeker_avatar_id: number;
  seeker_verification_status: string;
  seeker_languages: string[];
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude?: number;
  longitude?: number;
  dietary_needs: string[];
  medical_needs: string[];
  logistics: string[];
  description: string;
  availability: string;
  frequency: string;
  urgency: string;
  status: string;
  completion_pin?: string;
  posted_at: string;
}

export interface BackendOffer {
  id: string;
  donor_id: string;
  donor_name: string;
  donor_avatar_id: number;
  donor_verification_status: string;
  donor_languages: string[];
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude?: number;
  longitude?: number;
  description: string;
  image_url?: string;
  dietary_tags: string[];
  medical_tags?: string[];
  available_until: string;
  logistics: string[];
  availability: string;
  frequency: string;
  is_anonymous?: boolean;
  status: string;
  completion_pin?: string;
  created_at: string;
}

export interface BackendDonorPartner {
  id: string;
  name: string;
  category: string;
  tier: string;
  logo_url?: string;
  website_url?: string;
  total_contribution_display: string;
  is_anonymous: boolean;
  anonymous_name?: string;
  quote?: string;
  location?: string;
  since: string;
  is_recurring?: boolean;
}

export interface BackendRating {
  id: string;
  from_user_id: string;
  reviewer_name: string;
  reviewer_avatar_id: number;
  reviewer_role: string;
  reviewer_location: string;
  to_user_id: string;
  transaction_id: string;
  stars: number;
  comment: string;
  timestamp: string;
  is_public?: boolean;
}

export interface MatchAcceptResponse {
  thread_id: string;
  completion_pin: string;
  status: string;
}

export interface PinVerifyResponse {
  success: boolean;
  status: string;
  message: string;
}

export interface BackendMessage {
  id: string;
  sender_id: string;
  text: string;
  timestamp: string;
  is_system: boolean;
}

export interface BackendChatThread {
  id: string;
  item_type: string;
  item_id: string;
  student_id: string;
  donor_id: string;
  status: string;
  created_at: string;
  messages: BackendMessage[];
}

