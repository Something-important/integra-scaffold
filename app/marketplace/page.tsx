"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { Property } from "~~/types/property";

const Marketplace: NextPage = () => {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = ["All", "Residential", "Commercial", "Luxury", "Industrial", "Retail", "Office"];

  // Load properties from API
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        status: 'active'
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (selectedFilter !== "All") {
        params.append('propertyType', selectedFilter);
      }

      const response = await fetch(`/api/properties?${params}`);
      const data = await response.json();

      if (data.success) {
        setProperties(data.data || []);
      } else {
        setError(data.error || 'Failed to load properties');
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  // Reload properties when search term or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProperties();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedFilter]);

  const filteredProperties = properties;

  // Handle property detail navigation
  const handleViewDetails = (propertyId: string) => {
    router.push(`/marketplace/${propertyId}`);
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-base-content mb-4">
              Property Marketplace
            </h1>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Discover and invest in tokenized real estate properties
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search properties by name or location..."
                className="input input-bordered w-full pl-12 pr-4 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/50" />
            </div>

            <div className="flex gap-2">
              <select
                className="select select-bordered min-w-fit"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                {filters.map(filter => (
                  <option key={filter} value={filter}>{filter}</option>
                ))}
              </select>

              <button className="btn btn-outline">
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Listings */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-base-content">
              Available Properties
            </h2>
            <p className="text-base-content/60">
              {isLoading ? 'Loading...' : `${filteredProperties.length} properties found`}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-lg animate-pulse">
                <div className="h-48 bg-base-300"></div>
                <div className="card-body p-4">
                  <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-base-300 rounded w-1/2 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-5 bg-base-300 rounded w-16"></div>
                    <div className="h-5 bg-base-300 rounded w-20"></div>
                  </div>
                  <div className="h-8 bg-base-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-error mb-2">Error Loading Properties</h3>
            <p className="text-base-content/60 mb-4">{error}</p>
            <button className="btn btn-primary" onClick={loadProperties}>
              Try Again
            </button>
          </div>
        )}

        {/* Property Cards */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-300 group hover:scale-105">
                <figure className="relative overflow-hidden">
                  <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
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
                    <span className="text-base-content/40 text-sm">Property Image</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="badge badge-success gap-1">
                      <span className="text-xs">ROI {property.roi}%</span>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <div className="badge badge-primary badge-sm">
                      {property.propertyType}
                    </div>
                  </div>
                </figure>

                <div className="card-body p-4">
                  <h3 className="card-title text-lg">{property.title}</h3>
                  <p className="text-sm text-base-content/60 mb-2">{property.location}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {property.tags.map((tag) => (
                      <span key={tag} className="badge badge-outline badge-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Total Value:</span>
                      <span className="font-semibold">{property.price} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available Shares:</span>
                      <span>{property.availableShares}/{property.shares}</span>
                    </div>
                    <div className="w-full bg-base-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${((property.shares - property.availableShares) / property.shares) * 100}%` }}
                      ></div>
                    </div>
                    {property.monthlyIncome && (
                      <div className="flex justify-between text-sm">
                        <span>Monthly Income:</span>
                        <span className="font-semibold text-success">{property.monthlyIncome} ETH</span>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn btn-primary btn-sm flex-1 group-hover:btn-secondary transition-colors"
                      onClick={() => handleViewDetails(property.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-base-content mb-2">No properties found</h3>
            <p className="text-base-content/60">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;