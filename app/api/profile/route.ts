import { NextRequest, NextResponse } from 'next/server';
import supabase from '~~/utils/supabase';
import { CreateProfileRequest, ProfileResponse } from '~~/types/profile';

// Generate unique ID for new users
function generateUserId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 11);
}

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

    // Query user from database
    const result = await supabase.select('integra_users', {
      select: '*',
      where: { wallet_address: address.toLowerCase() }
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    const users = result.data || [];

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    const user = users[0] as any;

    // Transform database format to frontend format
    const profile = {
      address: user.wallet_address,
      displayName: user.display_name,
      bio: user.bio || undefined,
      profilePicture: user.profile_image || undefined,
      socialLinks: user.social_links,
      investmentPreferences: user.investment_preferences || [],
      kycStatus: user.kyc_status as "pending" | "verified" | "rejected",
      totalInvested: user.total_investments,
      propertiesOwned: user.properties_owned,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

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

    // Check if user already exists
    const existingResult = await supabase.select('integra_users', {
      select: '*',
      where: { wallet_address: address.toLowerCase() }
    });

    if (existingResult.error) {
      throw new Error(existingResult.error.message);
    }

    const existingUsers = existingResult.data || [];

    if (existingUsers.length > 0) {
      // Update existing user
      const updateData: any = {
        display_name: body.displayName.trim(),
        bio: body.bio?.trim() || null,
        profile_image: body.profilePicture?.trim() || null,
        social_links: body.socialLinks || {},
        investment_preferences: body.investmentPreferences || [],
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updateResult = await supabase.update('integra_users', updateData, {
        where: { wallet_address: address.toLowerCase() }
      });

      if (updateResult.error) {
        throw new Error(updateResult.error.message);
      }

      // Fetch updated profile to return
      const updatedResult = await supabase.select('integra_users', {
        select: '*',
        where: { wallet_address: address.toLowerCase() }
      });

      if (updatedResult.error || !updatedResult.data || updatedResult.data.length === 0) {
        throw new Error('Failed to fetch updated profile');
      }

      const updatedUser = updatedResult.data[0] as any;
      const savedProfile = {
        address: updatedUser.wallet_address,
        displayName: updatedUser.display_name,
        bio: updatedUser.bio || undefined,
        profilePicture: updatedUser.profile_image || undefined,
        socialLinks: updatedUser.social_links,
        investmentPreferences: updatedUser.investment_preferences || [],
        kycStatus: updatedUser.kyc_status as "pending" | "verified" | "rejected",
        totalInvested: updatedUser.total_investments,
        propertiesOwned: updatedUser.properties_owned,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      };

      return NextResponse.json({ success: true, data: savedProfile });
    } else {
      // Create new user
      const userData = {
        id: generateUserId(),
        wallet_address: address.toLowerCase(),
        email: null,
        display_name: body.displayName.trim(),
        status: 'pending',
        role: 'user',
        total_investments: '0.0',
        properties_owned: 0,
        join_date: new Date().toISOString(),
        last_active: new Date().toISOString(),
        kyc_status: 'pending',
        profile_image: body.profilePicture?.trim() || null,
        bio: body.bio?.trim() || null,
        location: null,
        investment_preferences: body.investmentPreferences || [],
        social_links: body.socialLinks || {},
        notifications: { email: true, sms: false, push: true }
      };

      const insertResult = await supabase.insert('integra_users', userData);

      if (insertResult.error) {
        throw new Error(insertResult.error.message);
      }

      // Transform created user to profile format
      const savedProfile = {
        address: address.toLowerCase(),
        displayName: userData.display_name,
        bio: userData.bio || undefined,
        profilePicture: userData.profile_image || undefined,
        socialLinks: userData.social_links,
        investmentPreferences: userData.investment_preferences || [],
        kycStatus: userData.kyc_status as "pending" | "verified" | "rejected",
        totalInvested: userData.total_investments,
        propertiesOwned: userData.properties_owned,
        createdAt: userData.join_date,
        updatedAt: userData.join_date
      };

      return NextResponse.json({ success: true, data: savedProfile });
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}