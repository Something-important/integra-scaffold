import { NextRequest, NextResponse } from 'next/server';
import { getProfile, saveProfile } from '~~/temp-utils/profileStorage';
import { CreateProfileRequest, ProfileResponse, UserProfile } from '~~/types/profile';

// Helper function to get wallet address from request headers or body
function getWalletAddress(request: NextRequest, body?: any): string | null {
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

  // Try to get address from request body
  if (body && body.address && body.address.startsWith('0x')) {
    return body.address;
  }

  return null;
}

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest): Promise<NextResponse<ProfileResponse>> {
  try {
    const address = getWalletAddress(request);

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Wallet address not provided. Please include address in Authorization header or X-Wallet-Address header.' },
        { status: 400 }
      );
    }

    const profile = await getProfile(address);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/profile - Create or update current user's profile
export async function POST(request: NextRequest): Promise<NextResponse<ProfileResponse>> {
  try {
    const body: CreateProfileRequest & { address?: string } = await request.json();

    // Get wallet address from headers or body
    const address = getWalletAddress(request, body);

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Wallet address not provided. Please include address in Authorization header, X-Wallet-Address header, or request body.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.displayName || body.displayName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Display name is required' },
        { status: 400 }
      );
    }

    // Prepare profile data
    const profileData: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
      address: address.toLowerCase(),
      displayName: body.displayName.trim(),
      bio: body.bio?.trim() || undefined,
      profilePicture: body.profilePicture?.trim() || undefined,
      socialLinks: body.socialLinks || {},
      investmentPreferences: body.investmentPreferences || [],
      kycStatus: 'pending', // Default to pending for new profiles
    };

    const savedProfile = await saveProfile(profileData);

    return NextResponse.json({ success: true, data: savedProfile });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}