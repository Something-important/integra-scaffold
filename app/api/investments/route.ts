import { NextRequest, NextResponse } from 'next/server';
import supabase from '~~/utils/supabase';

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

// POST /api/investments - Record investment in property_ownerships
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Get wallet address for investor
    const investorAddress = getWalletAddress(request);

    if (!investorAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address not provided' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.propertyId || !body.shares || !body.amountInvested) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: propertyId, shares, amountInvested' },
        { status: 400 }
      );
    }

    // Check if property exists and has enough available shares
    const propertyResult = await supabase.select('integra_properties', {
      select: '*',
      where: { id: body.propertyId }
    });

    if (propertyResult.error) {
      throw new Error(propertyResult.error.message);
    }

    const properties = propertyResult.data || [];
    if (properties.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    const property = properties[0] as any;
    if (property.available_shares < body.shares) {
      return NextResponse.json(
        { success: false, error: `Only ${property.available_shares} shares available` },
        { status: 400 }
      );
    }

    // Check if user already owns shares in this property
    const existingOwnershipResult = await supabase.select('integra_property_ownerships', {
      select: '*',
      where: {
        user_wallet_address: investorAddress.toLowerCase(),
        property_id: body.propertyId
      }
    });

    if (existingOwnershipResult.error) {
      throw new Error(existingOwnershipResult.error.message);
    }

    const existingOwnerships = existingOwnershipResult.data || [];

    if (existingOwnerships.length > 0) {
      // Update existing ownership record
      const existingOwnership = existingOwnerships[0] as any;
      const newTotalShares = existingOwnership.shares_owned + body.shares;
      const newTotalAmount = parseFloat(existingOwnership.purchase_price) + parseFloat(body.amountInvested);

      const updateResult = await supabase.update('integra_property_ownerships', {
        shares_owned: newTotalShares,
        purchase_price: newTotalAmount.toFixed(2) // USD with 2 decimal places
      }, {
        where: { id: existingOwnership.id }
      });

      if (updateResult.error) {
        throw new Error(updateResult.error.message);
      }
    } else {
      // Create new ownership record
      const insertResult = await supabase.insert('integra_property_ownerships', {
        user_wallet_address: investorAddress.toLowerCase(),
        property_id: body.propertyId,
        shares_owned: body.shares,
        purchase_price: parseFloat(body.amountInvested).toFixed(2) // USD with 2 decimal places
      });

      if (insertResult.error) {
        throw new Error(insertResult.error.message);
      }
    }

    // The database trigger will automatically update available_shares

    return NextResponse.json({
      success: true,
      message: 'Investment recorded successfully'
    });
  } catch (error) {
    console.error('Error recording investment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}