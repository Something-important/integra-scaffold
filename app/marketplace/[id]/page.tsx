"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Property } from "~~/types/property";
import {
  ArrowLeftIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  HomeIcon,
  WifiIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { parseUnits } from 'viem';
import { USDT_ABI } from '../../../contracts/usd'; // Create this if not already present


const PropertyDetail: NextPage = () => {
  const params = useParams();
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [shareAmount, setShareAmount] = useState<number>(1);
  const [isInvesting, setIsInvesting] = useState(false);
  const USDT_ADDRESS = "0xAD95fBF311a6EE0221a4BaDe4ae7DEfd8cE98eBb";
  const propertyId = params.id as string;

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const loadProperty = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      const data = await response.json();

      if (data.success) {
        setProperty(data.data);
      } else {
        setError(data.error || 'Property not found');
      }
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Failed to load property details');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateInvestmentAmount = () => {
    if (!property) return 0;
    const pricePerShare = parseFloat(property.price) / property.shares;
    return pricePerShare * shareAmount;
  };

  const handleInvestment = async () => {
  if (!property || !connectedAddress) return;

  setIsInvesting(true);

  try {
    const totalAmount = calculateInvestmentAmount(); // In ETH, but USDT has 6 decimals
    const usdtDecimals = 6; // USDT typically has 6 decimals
    const amountInUSDT = parseUnits(totalAmount.toFixed(usdtDecimals), usdtDecimals);

    // Replace with your treasury/escrow/recipient wallet address
    const recipient = property.recipientAddress || "0xYourTreasuryWallet"; // <-- Make sure this is defined!

    // 👉 1. Initiate USDT transfer
    const txHash = await writeContract({
      address: USDT_ADDRESS,
      abi: USDT_ABI,
      functionName: 'transfer',
      args: [recipient, amountInUSDT],
      account: connectedAddress, // wallet sending the transaction
    });

    // 👉 2. Wait for confirmation
    const receipt = await waitForTransactionReceipt({ hash: txHash });

    // 👉 3. Only after confirmation, record investment in backend
    const response = await fetch('/api/investments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Wallet-Address': connectedAddress,
      },
      body: JSON.stringify({
        propertyId: property.id,
        shares: shareAmount,
        amountInvested: totalAmount.toFixed(6),
        sharePrice: (parseFloat(property.price) / property.shares).toFixed(6),
        transactionHash: txHash,
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert('Investment successful!');
      setShowInvestModal(false);
      setShareAmount(1);
      loadProperty(); // Refresh property to show updated available shares
    } else {
      alert('Backend error: ' + data.error);
    }
  } catch (err) {
    console.error('USDT transfer or investment error:', err);
    alert('Transaction failed. Please try again.');
  } finally {
    setIsInvesting(false);
  }
};


  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-base-300 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-64 bg-base-300 rounded-xl"></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-20 bg-base-300 rounded"></div>
                  <div className="h-20 bg-base-300 rounded"></div>
                  <div className="h-20 bg-base-300 rounded"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-base-300 rounded w-3/4"></div>
                <div className="h-4 bg-base-300 rounded w-1/2"></div>
                <div className="h-32 bg-base-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-base-content mb-4">Property Not Found</h2>
          <p className="text-base-content/60 mb-6">{error}</p>
          <button className="btn btn-primary" onClick={() => router.push('/marketplace')}>
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => router.push('/marketplace')}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Marketplace
        </button>
      </div>

      {/* Property Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                {property.image ? (
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <span className="text-base-content/40 text-lg">Property Image</span>
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="badge badge-primary badge-lg">
                  {property.propertyType}
                </div>
                <div className="badge badge-success badge-lg">
                  ROI {property.roi}%
                </div>
              </div>
            </div>

            {/* Additional Images Grid */}
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {property.images.slice(1, 4).map((img, index) => (
                  <div key={index} className="aspect-video bg-base-200 rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`${property.title} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h3 className="card-title">About This Property</h3>
                <p className="text-base-content/80 leading-relaxed">
                  {property.description || "No description available for this property."}
                </p>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="card bg-base-100 shadow-lg border border-base-300">
                <div className="card-body">
                  <h3 className="card-title">Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details & Investment */}
          <div className="space-y-6">
            {/* Property Info */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h1 className="text-3xl font-bold text-base-content mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-base-content/60 mb-4">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{property.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-base-200 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{property.price}</div>
                    <div className="text-sm text-base-content/60">USD Total Value</div>
                  </div>
                  <div className="text-center p-3 bg-base-200 rounded-lg">
                    <div className="text-2xl font-bold text-success">{property.roi}%</div>
                    <div className="text-sm text-base-content/60">Expected ROI</div>
                  </div>
                </div>

                {/* Property Stats */}
                <div className="space-y-3">
                  {property.totalArea && (
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Total Area:</span>
                      <span className="font-medium">{property.totalArea.toLocaleString()} sq ft</span>
                    </div>
                  )}
                  {property.bedrooms && (
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Bedrooms:</span>
                      <span className="font-medium">{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Bathrooms:</span>
                      <span className="font-medium">{property.bathrooms}</span>
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Year Built:</span>
                      <span className="font-medium">{property.yearBuilt}</span>
                    </div>
                  )}
                  {property.monthlyIncome && (
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Monthly Income:</span>
                      <span className="font-medium text-success">{property.monthlyIncome} USD</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Investment Details */}
            <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
              <div className="card-body">
                <h3 className="card-title text-primary">Investment Opportunity</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Shares:</span>
                    <span className="font-bold">{property.shares.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Available Shares:</span>
                    <span className="font-bold text-success">{property.availableShares.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Price per Share:</span>
                    <span className="font-bold">{(parseFloat(property.price) / property.shares).toFixed(6)} USD</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Investment Progress</span>
                      <span>{Math.round(((property.shares - property.availableShares) / property.shares) * 100)}%</span>
                    </div>
                    <div className="w-full bg-base-200 rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{ width: `${((property.shares - property.availableShares) / property.shares) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Investment Button */}
                  <div className="pt-4">
                    {connectedAddress ? (
                      <button
                        className="btn btn-primary w-full btn-lg"
                        onClick={() => setShowInvestModal(true)}
                        disabled={property.availableShares === 0}
                      >
                        <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                        {property.availableShares === 0 ? 'Sold Out' : 'Invest Now'}
                      </button>
                    ) : (
                      <button className="btn btn-outline w-full btn-lg" disabled>
                        Connect Wallet to Invest
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Property Tags */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h3 className="card-title">Property Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {property.tags.map((tag, index) => (
                    <span key={index} className="badge badge-outline">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Invest in {property?.title}</h3>

            <div className="space-y-4">
              {/* Share Input */}
              <div>
                <label className="label">
                  <span className="label-text">Number of Shares</span>
                  <span className="label-text-alt">Max: {property?.availableShares}</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={property?.availableShares}
                  value={shareAmount}
                  onChange={(e) => setShareAmount(Math.max(1, Math.min(property?.availableShares || 1, parseInt(e.target.value) || 1)))}
                  className="input input-bordered w-full"
                  placeholder="Enter number of shares"
                />
              </div>

              {/* Investment Summary */}
              <div className="bg-base-200 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Price per Share:</span>
                  <span className="font-medium">
                    {property ? (parseFloat(property.price) / property.shares).toFixed(6) : '0'} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shares:</span>
                  <span className="font-medium">{shareAmount}</span>
                </div>
                <hr className="border-base-300" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary">
                    {calculateInvestmentAmount().toFixed(6)} USD
                  </span>
                </div>
                <p className="text-xs text-base-content/60 mt-2">
                  * Transaction will be processed in USDT equivalent
                </p>
              </div>

              {/* Action Buttons */}
              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowInvestModal(false);
                    setShareAmount(1);
                  }}
                  disabled={isInvesting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleInvestment}
                  disabled={isInvesting || shareAmount < 1 || shareAmount > (property?.availableShares || 0)}
                >
                  {isInvesting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      Confirm Investment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;