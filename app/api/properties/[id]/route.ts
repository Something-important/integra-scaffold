import { NextRequest, NextResponse } from 'next/server';
import supabase from '~~/utils/supabase';
import { PropertyResponse, UpdatePropertyRequest, Property } from '~~/types/property';

// Helper function to get wallet address from request headers
function getWalletAddress(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer 0x')) {
    return authHeader.substring(7);
  }

  const walletHeader = request.headers.get('x-wallet-address');
  if (walletHeader && walletHeader.startsWith('0x')) {
    return walletHeader;
  }

  return null;
}

// GET /api/properties/[id] - Get specific property by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<PropertyResponse>> {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Get property from Supabase
    const result = await supabase.select('integra_properties', {
      select: '*',
      where: { id }
    });

    if (result.error) {
      console.error('Supabase error:', result.error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    const properties = result.data || [];

    if (properties.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    const property = properties[0] as any;

    // Transform to match frontend format (camelCase)
    const transformedProperty = {
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
    };

    return NextResponse.json({ success: true, data: transformedProperty });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// TODO: Implement PUT and DELETE methods with Supabase
// Currently only GET is implemented and working