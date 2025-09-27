import { NextRequest, NextResponse } from 'next/server';
import { getProperty, saveProperty, deleteProperty } from '~~/temp-utils/propertyStorage';
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

    const property = await getProperty(id);

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id] - Update specific property (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<PropertyResponse>> {
  try {
    const { id } = params;
    const body: UpdatePropertyRequest = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Get wallet address for authorization
    const walletAddress = getWalletAddress(request);

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address not provided. Please include address in Authorization header or X-Wallet-Address header.' },
        { status: 400 }
      );
    }

    // Get existing property
    const existingProperty = await getProperty(id);

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (existingProperty.ownerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only property owner can update this property' },
        { status: 403 }
      );
    }

    // Prepare updated property data
    const updatedPropertyData: Omit<Property, 'createdAt' | 'updatedAt'> = {
      ...existingProperty,
      ...body,
      id, // Ensure ID doesn't change
      ownerAddress: existingProperty.ownerAddress, // Ensure owner doesn't change
    };

    const savedProperty = await saveProperty(updatedPropertyData);

    return NextResponse.json({ success: true, data: savedProperty });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete specific property (owner only)
export async function DELETE(
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

    // Get wallet address for authorization
    const walletAddress = getWalletAddress(request);

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address not provided. Please include address in Authorization header or X-Wallet-Address header.' },
        { status: 400 }
      );
    }

    // Get existing property
    const existingProperty = await getProperty(id);

    if (!existingProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (existingProperty.ownerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only property owner can delete this property' },
        { status: 403 }
      );
    }

    const deleted = await deleteProperty(id);

    if (deleted) {
      return NextResponse.json({ success: true, data: existingProperty });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete property' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}