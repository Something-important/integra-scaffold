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

// GET /api/user/investments - Get user's property investments and stats
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const address = getWalletAddress(request);

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Wallet address not provided. Please include address in Authorization header or X-Wallet-Address header.' },
        { status: 400 }
      );
    }

    // Get user's property ownerships with property details
    const ownershipResult = await supabase.select('integra_property_ownerships', {
      select: '*',
      where: { user_wallet_address: address.toLowerCase() }
    });

    if (ownershipResult.error) {
      throw new Error(ownershipResult.error.message);
    }

    const ownerships = ownershipResult.data || [];

    if (ownerships.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          properties: [],
          stats: {
            totalInvested: "0.000",
            currentValue: "0.000",
            totalROI: "0.0%",
            monthlyIncome: "0.000",
            propertiesOwned: 0,
          }
        }
      });
    }

    // Get property details for all owned properties
    const propertyIds = ownerships.map((ownership: any) => ownership.property_id);
    const propertiesResult = await supabase.select('integra_properties', {
      select: '*'
    });

    if (propertiesResult.error) {
      throw new Error(propertiesResult.error.message);
    }

    const allProperties = propertiesResult.data || [];
    const userProperties = allProperties.filter((property: any) =>
      propertyIds.includes(property.id)
    );

    // Calculate stats and format data
    let totalInvested = 0;
    let currentValue = 0;
    let monthlyIncome = 0;

    const formattedProperties = ownerships.map((ownership: any) => {
      const property = userProperties.find((p: any) => p.id === ownership.property_id);

      if (!property) return null;

      const sharesOwned = ownership.shares_owned;
      const totalShares = property.total_shares;
      const shareValue = parseFloat(property.price) / totalShares;
      const userInvestment = parseFloat(ownership.purchase_price);
      const propCurrentValue = userInvestment * (1 + parseFloat(property.roi) / 100);
      const propMonthlyIncome = property.monthly_income ?
        parseFloat(property.monthly_income) * (sharesOwned / totalShares) : 0;

      totalInvested += userInvestment;
      currentValue += propCurrentValue;
      monthlyIncome += propMonthlyIncome;

      return {
        id: property.id,
        title: property.title,
        location: property.location,
        sharesOwned,
        totalShares,
        currentValue: propCurrentValue.toFixed(3),
        totalInvested: userInvestment.toFixed(3),
        roi: `+${property.roi}%`,
        monthlyIncome: propMonthlyIncome.toFixed(3),
        purchaseDate: ownership.purchase_date,
      };
    }).filter(Boolean);

    const totalROI = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested * 100) : 0;

    const stats = {
      totalInvested: totalInvested.toFixed(3),
      currentValue: currentValue.toFixed(3),
      totalROI: `${totalROI > 0 ? '+' : ''}${totalROI.toFixed(1)}%`,
      monthlyIncome: monthlyIncome.toFixed(3),
      propertiesOwned: formattedProperties.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        properties: formattedProperties,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching user investments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}