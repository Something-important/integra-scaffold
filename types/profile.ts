export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  website?: string;
  discord?: string;
}

export interface UserProfile {
  address: string;                    // Wallet address (primary key)
  displayName: string;                // User's chosen display name
  bio?: string;                      // Profile description
  profilePicture?: string;           // URL to profile image
  socialLinks?: SocialLinks;         // Social media links
  investmentPreferences?: string[];  // e.g., ["residential", "commercial", "industrial"]
  kycStatus: "pending" | "verified" | "rejected";
  totalInvested?: string;           // Total amount invested (in ETH)
  propertiesOwned?: number;         // Number of properties user has shares in
  createdAt: string;                // ISO date string
  updatedAt: string;                // ISO date string
}

export interface CreateProfileRequest {
  displayName: string;
  bio?: string;
  profilePicture?: string;
  socialLinks?: SocialLinks;
  investmentPreferences?: string[];
}

export interface UpdateProfileRequest extends Partial<CreateProfileRequest> {
  address: string;
}

export interface ProfileResponse {
  success: boolean;
  data?: UserProfile;
  error?: string;
}

export interface ProfilesResponse {
  success: boolean;
  data?: UserProfile[];
  error?: string;
}