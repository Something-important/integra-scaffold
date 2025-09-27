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

const PropertyDetail: NextPage = () => {
  const params = useParams();
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                    <div className="text-sm text-base-content/60">ETH Total Value</div>
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
                      <span className="font-medium text-success">{property.monthlyIncome} ETH</span>
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
                    <span className="font-bold">{(parseFloat(property.price) / property.shares).toFixed(6)} ETH</span>
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
                      <button className="btn btn-primary w-full btn-lg">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                        Invest Now
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
    </div>
  );
};

export default PropertyDetail;