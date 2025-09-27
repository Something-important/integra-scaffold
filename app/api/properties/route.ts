import { NextRequest, NextResponse } from 'next/server';
import supabase from '~~/utils/supabase';
import { CreatePropertyRequest, PropertiesResponse, PropertyResponse, Property, PropertyFilters } from '~~/types/property';

// Helper function to get wallet address from request headers
function getWalletAddress(request: NextRequest): string | null {
  // Try to get address from Authorization header (format: "Bearer 0x...")
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer 0x')) {
    return authHeader.substring(7); // Remove "Bearer " prefix
  }

  // Try to get address from X-Wallet-Address header
  const walletHeader = request.headers.get('x-wallet-address');
  if (walletHeader && walletHeader.startsWith('0x')) {
    return walletHeader;
  }

  return null;
}

// Generate unique ID for new properties
function generatePropertyId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// GET /api/properties - Get all properties with optional filters
export async function GET(request: NextRequest): Promise<NextResponse<PropertiesResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    const filters: PropertyFilters = {
      search: searchParams.get('search') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      location: searchParams.get('location') || undefined,
      status: searchParams.get('status') || 'active', // Default to active properties
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    // Handle tags parameter (can be comma-separated)
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      filters.tags = tagsParam.split(',');
    }

    // Build Supabase query
    let query = supabase.select('integra_properties', {
      select: '*',
      order: 'created_at.desc'
    });

    const result = await query;

    if (result.error) {
      throw new Error(result.error.message);
    }

    let properties = result.data || [];

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      properties = properties.filter((property: any) =>
        property.title.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm) ||
        property.description?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.propertyType && filters.propertyType !== "All") {
      properties = properties.filter((property: any) => property.property_type === filters.propertyType);
    }

    if (filters.tags && filters.tags.length > 0) {
      properties = properties.filter((property: any) =>
        filters.tags!.some(tag => property.tags.includes(tag))
      );
    }

    if (filters.status) {
      properties = properties.filter((property: any) => property.status === filters.status);
    }

    if (filters.location) {
      properties = properties.filter((property: any) =>
        property.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    const total = properties.length;

    // Apply pagination
    if (filters.offset !== undefined) {
      properties = properties.slice(filters.offset);
    }

    if (filters.limit !== undefined) {
      properties = properties.slice(0, filters.limit);
    }

    // Transform to match frontend format (camelCase)
    const transformedProperties = properties.map((property: any) => ({
      id: property.id,
      title: property.title,
      description: property.description,
      location: property.location,
      price: property.price,
      shares: property.total_shares,
      availableShares: property.available_shares,
      image: property.image,
      images: property.images,
      tags: property.tags,
      roi: property.roi,
      propertyType: property.property_type,
      ownerAddress: property.owner_address,
      status: property.status,
      monthlyIncome: property.monthly_income,
      totalArea: property.total_area,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      yearBuilt: property.year_built,
      amenities: property.amenities,
      coordinates: property.coordinates,
      createdAt: property.created_at,
      updatedAt: property.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: transformedProperties,
      total
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property (requires wallet connection)
export async function POST(request: NextRequest): Promise<NextResponse<PropertyResponse>> {
  try {
    const body: CreatePropertyRequest = await request.json();

    // Get wallet address for property owner
    const ownerAddress = getWalletAddress(request);

    if (!ownerAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address not provided. Please include address in Authorization header or X-Wallet-Address header.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Property title is required' },
        { status: 400 }
      );
    }

    if (!body.location || body.location.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Property location is required' },
        { status: 400 }
      );
    }

    if (!body.price || parseFloat(body.price) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid property price is required' },
        { status: 400 }
      );
    }

    if (!body.shares || body.shares <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid number of shares is required' },
        { status: 400 }
      );
    }

    // Prepare property data
    const propertyData: Omit<Property, 'createdAt' | 'updatedAt'> = {
      id: generatePropertyId(),
      title: body.title.trim(),
      description: body.description?.trim(),
      location: body.location.trim(),
      price: body.price,
      shares: body.shares,
      availableShares: body.shares, // Initially all shares are available
      image: body.image,
      images: body.images || [],
      tags: body.tags || [],
      roi: body.roi || "0",
      propertyType: body.propertyType,
      ownerAddress: ownerAddress.toLowerCase(),
      status: 'active',
      monthlyIncome: body.monthlyIncome,
      totalArea: body.totalArea,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      yearBuilt: body.yearBuilt,
      amenities: body.amenities || [],
      coordinates: body.coordinates,
    };

    // Insert property into Supabase
    const result = await supabase.insert('integra_properties', {
      id: propertyData.id,
      title: propertyData.title,
      description: propertyData.description,
      location: propertyData.location,
      price: propertyData.price,
      total_shares: propertyData.shares,
      available_shares: propertyData.shares, // Initially all shares are available
      image: propertyData.image,
      images: propertyData.images || [],
      tags: propertyData.tags || [],
      roi: propertyData.roi || "0",
      property_type: propertyData.propertyType,
      owner_address: propertyData.ownerAddress,
      status: 'active',
      monthly_income: propertyData.monthlyIncome,
      total_area: propertyData.totalArea,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      year_built: propertyData.yearBuilt,
      amenities: propertyData.amenities || [],
      coordinates: propertyData.coordinates,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    const savedProperty = result.data;

    return NextResponse.json({ success: true, data: savedProperty });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}