"use client";

import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
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
import { writeContract, waitForTransactionReceipt, getGasPrice } from '@wagmi/core';
import { parseUnits, formatEther } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { USDC_ABI, USDC_ADDRESS } from '../../../contracts/usd';

const PropertyDetailClient: NextPage = () => {
  const params = useParams();
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [shareAmount, setShareAmount] = useState<number>(1);
  const [isInvesting, setIsInvesting] = useState(false);
  const [estimatedGasFee, setEstimatedGasFee] = useState<string | null>(null);
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);
  const propertyId = params.id as string;

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  // Auto-estimate gas fees when modal opens or parameters change
  useEffect(() => {
    if (showInvestModal && connectedAddress && property) {
      estimateTransactionFees();
    }
  }, [showInvestModal, shareAmount, connectedAddress, property]);

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

  // Check if user is on correct network
  const isCorrectNetwork = chainId === arbitrumSepolia.id;

  // Estimate gas fees for the transaction
  const estimateTransactionFees = async () => {
    if (!property || !connectedAddress || !isCorrectNetwork) return;

    setIsEstimatingGas(true);
    try {
      // Get current gas price for basic estimation
      const gasPrice = await getGasPrice(wagmiConfig, {
        chainId: arbitrumSepolia.id
      });

      // Use a typical gas amount for ERC20 transfers on Arbitrum (~50,000 gas)
      const estimatedGasAmount = BigInt(50000);
      const estimatedFee = estimatedGasAmount * gasPrice;
      setEstimatedGasFee(formatEther(estimatedFee));
    } catch (error) {
      console.error('Gas estimation failed:', error);
      setEstimatedGasFee('~0.001'); // Fallback estimate for Arbitrum
    } finally {
      setIsEstimatingGas(false);
    }
  };

  const handleInvestment = async () => {
  if (!property || !connectedAddress) return;

  // Check if user is on correct network
  if (!isCorrectNetwork) {
    const shouldSwitch = confirm('You need to switch to Arbitrum Sepolia to make this transaction. Switch now?');
    if (shouldSwitch) {
      try {
        await switchChain({ chainId: arbitrumSepolia.id });
        return; // Exit and let user try again after switch
      } catch (error) {
        alert('Failed to switch network. Please switch manually to Arbitrum Sepolia.');
        return;
      }
    } else {
      return; // User declined to switch
    }
  }

  setIsInvesting(true);

  let txHash = null;
  let transactionSucceeded = false;

  try {
    const totalAmount = calculateInvestmentAmount(); // In USD, USDC has 6 decimals
    const usdcDecimals = 6; // USDC has 6 decimals
    const amountInUSDC = parseUnits(totalAmount.toFixed(usdcDecimals), usdcDecimals);

    // Replace with your treasury/escrow/recipient wallet address
    const recipient =  "0x4c4267C2c7CFd74550f8c58FADaDf34ca73FA7F0"; // <-- Make sure this is defined!

    // 👉 1. Initiate USDC transfer (let wallet handle gas)
    txHash = await writeContract(wagmiConfig, {
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [recipient, amountInUSDC],
    });

    console.log('💫 Waiting for transaction confirmation...', txHash);

    // 👉 2. Wait for confirmation
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash: txHash,
    });

    // Mark transaction as succeeded on blockchain
    transactionSucceeded = true;
    console.log('✅ USDC transaction succeeded:', {
      hash: txHash,
      status: receipt.status,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed
    });

    // 👉 3. Try to record investment in backend (non-critical)
    try {
      console.log('📤 Recording investment in backend...', {
        propertyId: property.id,
        shares: shareAmount,
        amountInvested: totalAmount.toFixed(6),
        transactionHash: txHash
      });

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

      console.log('📥 Backend response status:', response.status);
      const data = await response.json();
      console.log('📥 Backend response data:', data);

      if (data.success) {
        alert('✅ Investment successful! Your USDC has been transferred and recorded.');
        setShowInvestModal(false);
        setShareAmount(1);
        loadProperty(); // Refresh property to show updated available shares
      } else {
        console.error('❌ Backend error:', data.error);
        alert(`⚠️ Investment completed on blockchain (${txHash}), but there was a backend error: ${data.error}\n\nYour USDC transfer succeeded, but the investment may not be recorded properly. Please contact support.`);
      }
    } catch (backendError) {
      console.error('❌ Backend recording error:', backendError);
      alert(`⚠️ Investment completed on blockchain (${txHash}), but failed to record in backend.\n\nYour USDC transfer succeeded! Please contact support to ensure your investment is properly recorded.`);
    }

  } catch (err) {
    console.error('🚨 Main catch block triggered:', {
      error: err,
      transactionSucceeded,
      txHash,
      errorMessage: (err as any)?.message || err?.toString() || ''
    });

    // If transaction succeeded but we're in catch block, it means blockchain worked but something else failed
    if (transactionSucceeded && txHash) {
      console.log('✅ Blockchain transaction succeeded, but other error occurred');
      alert(`⚠️ Investment completed on blockchain (${txHash}), but there was an error processing the investment.\n\nYour USDC transfer succeeded! Please contact support.`);
      // Still close modal and refresh since the important part (blockchain transaction) worked
      setShowInvestModal(false);
      setShareAmount(1);
      loadProperty();
    } else {
      // Actual blockchain transaction failure
      const errorMessage = (err as any)?.message || err?.toString() || '';
      console.log('❌ Blockchain transaction failed:', errorMessage);

      // Show appropriate error message for blockchain failures
      if (errorMessage.includes('insufficient funds')) {
        alert('❌ Insufficient funds. Please check your ETH balance for gas fees.');
      } else if (errorMessage.includes('rejected')) {
        alert('❌ Transaction rejected by user.');
      } else if (errorMessage.includes('gas') || errorMessage.includes('fee')) {
        alert('❌ Transaction failed due to gas issues. Please try again or check your ETH balance.');
      } else {
        alert('❌ Transaction failed. Please try again.');
      }
    }
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

                  {/* Network Warning */}
                  {connectedAddress && !isCorrectNetwork && (
                    <div className="alert alert-warning mb-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-5 w-5" />
                        <div>
                          <div className="font-medium">Wrong Network</div>
                          <div className="text-sm">Switch to Arbitrum Sepolia to invest</div>
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => switchChain({ chainId: arbitrumSepolia.id })}
                      >
                        Switch Network
                      </button>
                    </div>
                  )}

                  {/* Investment Button */}
                  <div className="pt-4">
                    {connectedAddress ? (
                      <button
                        className="btn btn-primary w-full btn-lg"
                        onClick={() => setShowInvestModal(true)}
                        disabled={property.availableShares === 0 || !isCorrectNetwork}
                      >
                        <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                        {property.availableShares === 0 ? 'Sold Out' :
                         !isCorrectNetwork ? 'Switch to Arbitrum Sepolia' : 'Invest Now'}
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
                  * Transaction will be processed in USDC
                </p>
              </div>

              {/* Gas Fee Information */}
              <div className="bg-base-200 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span>Estimated Gas Fee:</span>
                  <div className="flex items-center gap-2">
                    {isEstimatingGas ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : estimatedGasFee ? (
                      <span className="font-medium text-warning">
                        ~{typeof estimatedGasFee === 'string' ? estimatedGasFee : parseFloat(estimatedGasFee).toFixed(6)} ETH
                      </span>
                    ) : (
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={estimateTransactionFees}
                        disabled={!connectedAddress || !isCorrectNetwork}
                      >
                        Estimate
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-base-content/60">
                  Gas fees will be determined by your wallet based on current network conditions.
                </div>
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

export default PropertyDetailClient;