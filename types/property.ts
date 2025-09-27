export interface Property {
  id: string;                        // Unique property ID
  title: string;                     // Property title
  description?: string;              // Detailed description
  location: string;                  // Property location
  price: string;                     // Total property value (in ETH)
  shares: number;                    // Total number of shares
  availableShares: number;           // Currently available shares
  image?: string;                    // Property image URL
  images?: string[];                 // Additional property images
  tags: string[];                    // Property tags (Residential, Commercial, etc.)
  roi: string;                       // Expected ROI percentage
  propertyType: "Residential" | "Commercial" | "Industrial" | "Retail" | "Office" | "Luxury";
  ownerAddress: string;              // Wallet address of property owner/lister
  status: "active" | "sold" | "pending" | "draft";
  monthlyIncome?: string;            // Expected monthly income (in ETH)
  totalArea?: number;                // Property area in sq ft
  bedrooms?: number;                 // Number of bedrooms (for residential)
  bathrooms?: number;                // Number of bathrooms (for residential)
  yearBuilt?: number;                // Year property was built
  amenities?: string[];              // Property amenities
  coordinates?: {                    // Property coordinates for map
    lat: number;
    lng: number;
  };
  createdAt: string;                 // ISO date string
  updatedAt: string;                 // ISO date string
}

export interface CreatePropertyRequest {
  title: string;
  description?: string;
  location: string;
  price: string;
  shares: number;
  image?: string;
  images?: string[];
  tags: string[];
  roi: string;
  propertyType: "Residential" | "Commercial" | "Industrial" | "Retail" | "Office" | "Luxury";
  monthlyIncome?: string;
  totalArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  amenities?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  id: string;
}

export interface PropertyFilters {
  search?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  tags?: string[];
  status?: string;
  limit?: number;
  offset?: number;
}

export interface PropertyResponse {
  success: boolean;
  data?: Property;
  error?: string;
}

export interface PropertiesResponse {
  success: boolean;
  data?: Property[];
  total?: number;
  error?: string;
}

export interface PropertyStats {
  totalProperties: number;
  totalValue: string;
  averageROI: string;
  propertiesByType: Record<string, number>;
}