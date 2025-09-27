import { NextRequest, NextResponse } from 'next/server';
import { getProfile } from '~~/temp-utils/profileStorage';
import { ProfileResponse } from '~~/types/profile';

// GET /api/profile/[address] - Get specific user's profile by wallet address
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
): Promise<NextResponse<ProfileResponse>> {
  try {
    const { address } = params;

    // Validate address format
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
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

    // Return public profile (you might want to filter sensitive data here)
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching profile by address:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}