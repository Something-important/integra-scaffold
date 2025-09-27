import { NextRequest, NextResponse } from 'next/server';
import { getProperties, saveProperty } from '~~/temp-utils/propertyStorage';
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

    const { properties, total } = await getProperties(filters);

    return NextResponse.json({
      success: true,
      data: properties,
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

    const savedProperty = await saveProperty(propertyData);

    return NextResponse.json({ success: true, data: savedProperty });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}