import { NextRequest, NextResponse } from 'next/server';
import supabase from '~~/utils/supabase';
import { ProfileResponse } from '~~/types/profile';

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

// Generate unique ID for new users
function generateUserId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 11);
}

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
      // Return default profile if user doesn't exist
      const defaultProfile = {
        address: address.toLowerCase(),
        displayName: address.slice(0, 6) + '...' + address.slice(-4),
        bio: undefined,
        profilePicture: undefined,
        socialLinks: undefined,
        investmentPreferences: [],
        kycStatus: 'pending' as const,
        totalInvested: '0.0',
        propertiesOwned: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({ success: true, data: defaultProfile });
    }

    const user = users[0] as any;

    // Transform database format to frontend format
    const profile = {
      address: user.wallet_address,
      displayName: user.display_name,
      bio: user.bio,
      profilePicture: user.profile_image,
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
    console.error('Error fetching profile by address:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/profile/[address] - Create or update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { address: string } }
): Promise<NextResponse<ProfileResponse>> {
  try {
    const { address } = params;
    const body = await request.json();

    // Validate address format
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Get wallet address from headers for authorization
    const requestingAddress = getWalletAddress(request);

    // Only allow users to update their own profile
    if (!requestingAddress || requestingAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - can only update your own profile' },
        { status: 403 }
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
      const updateData: any = {};

      if (body.email !== undefined) updateData.email = body.email;
      if (body.displayName !== undefined) updateData.display_name = body.displayName;
      if (body.profileImage !== undefined) updateData.profile_image = body.profileImage;
      if (body.bio !== undefined) updateData.bio = body.bio;
      if (body.location !== undefined) updateData.location = body.location;
      if (body.investmentPreferences !== undefined) updateData.investment_preferences = body.investmentPreferences;
      if (body.socialLinks !== undefined) updateData.social_links = body.socialLinks;
      if (body.notifications !== undefined) updateData.notifications = body.notifications;

      updateData.last_active = new Date().toISOString();
      updateData.updated_at = new Date().toISOString();

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
      const updatedProfile = {
        address: updatedUser.wallet_address,
        displayName: updatedUser.display_name,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profile_image,
        socialLinks: updatedUser.social_links,
        investmentPreferences: updatedUser.investment_preferences || [],
        kycStatus: updatedUser.kyc_status as "pending" | "verified" | "rejected",
        totalInvested: updatedUser.total_investments,
        propertiesOwned: updatedUser.properties_owned,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      };

      return NextResponse.json({
        success: true,
        data: updatedProfile
      });
    } else {
      // Create new user
      const userData = {
        id: generateUserId(),
        wallet_address: address.toLowerCase(),
        email: body.email || null,
        display_name: body.displayName || (address.slice(0, 6) + '...' + address.slice(-4)),
        status: 'pending',
        role: 'user',
        total_investments: '0.0',
        properties_owned: 0,
        join_date: new Date().toISOString(),
        last_active: new Date().toISOString(),
        kyc_status: 'pending',
        profile_image: body.profileImage || null,
        bio: body.bio || null,
        location: body.location || null,
        investment_preferences: body.investmentPreferences || [],
        social_links: body.socialLinks || {},
        notifications: body.notifications || { email: true, sms: false, push: true }
      };

      const insertResult = await supabase.insert('integra_users', userData);

      if (insertResult.error) {
        throw new Error(insertResult.error.message);
      }

      // Transform created user to profile format
      const createdProfile = {
        address: address.toLowerCase(),
        displayName: userData.display_name,
        bio: userData.bio,
        profilePicture: userData.profile_image,
        socialLinks: userData.social_links,
        investmentPreferences: userData.investment_preferences || [],
        kycStatus: userData.kyc_status as "pending" | "verified" | "rejected",
        totalInvested: userData.total_investments,
        propertiesOwned: userData.properties_owned,
        createdAt: userData.join_date,
        updatedAt: userData.join_date
      };

      return NextResponse.json({
        success: true,
        data: createdProfile
      });
    }
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}