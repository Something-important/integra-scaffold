"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import {
  ChartBarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState("overview");
  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalInvested: "0 USD",
    currentValue: "0 USD",
    totalROI: "0%",
    monthlyIncome: "0 USD",
    propertiesOwned: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data when address is available
  useEffect(() => {
    if (connectedAddress) {
      loadUserData();
    }
  }, [connectedAddress]);

  const loadUserData = async () => {
    if (!connectedAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch user investments from the new API endpoint
      const response = await fetch('/api/user/investments', {
        headers: {
          'X-Wallet-Address': connectedAddress,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user investments');
      }

      const { properties, stats } = data.data;

      setUserProperties(properties);
      setUserStats(stats);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!connectedAddress) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-base-content mb-4">Connect Your Wallet</h2>
          <p className="text-base-content/60">Please connect your wallet to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-base-content mb-2">
                Your Dashboard
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-base-content/70">Connected as:</span>
                <Address address={connectedAddress} />
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => router.push('/marketplace')}
            >
              <PlusIcon className="h-5 w-5" />
              Invest in Property
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="text-center py-8 mb-8">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-error mb-4">{error}</p>
            <button className="btn btn-primary" onClick={loadUserData}>
              Retry Loading Dashboard
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">Total Invested</p>
                  {isLoading ? (
                    <div className="h-8 bg-base-300 rounded w-20 animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-base-content">{userStats.totalInvested} USD</p>
                  )}
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">Current Value</p>
                  {isLoading ? (
                    <div className="h-8 bg-base-300 rounded w-20 animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-base-content">{userStats.currentValue} USD</p>
                  )}
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-success" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">Total ROI</p>
                  {isLoading ? (
                    <div className="h-8 bg-base-300 rounded w-16 animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-success">{userStats.totalROI}</p>
                  )}
                </div>
                <ChartBarIcon className="h-8 w-8 text-success" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">Monthly Income</p>
                  {isLoading ? (
                    <div className="h-8 bg-base-300 rounded w-20 animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-base-content">{userStats.monthlyIncome} USD</p>
                  )}
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-secondary" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">Properties</p>
                  {isLoading ? (
                    <div className="h-8 bg-base-300 rounded w-8 animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-base-content">{userStats.propertiesOwned}</p>
                  )}
                </div>
                <BuildingOfficeIcon className="h-8 w-8 text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 mb-6 w-fit">
          <a
            className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </a>
          <a
            className={`tab ${activeTab === "properties" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("properties")}
          >
            My Properties
          </a>
          <a
            className={`tab ${activeTab === "transactions" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </a>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Portfolio Performance Chart Placeholder */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h3 className="card-title mb-4">Portfolio Performance</h3>
                <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                  <span className="text-base-content/40">Performance Chart Coming Soon</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body">
                <h3 className="card-title mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div>
                      <p className="font-medium">Bought 50 shares</p>
                      <p className="text-sm text-base-content/60">Modern Downtown Apartment</p>
                    </div>
                    <span className="text-sm text-base-content/60">2 days ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div>
                      <p className="font-medium">Received dividend</p>
                      <p className="text-sm text-base-content/60">0.02 ETH</p>
                    </div>
                    <span className="text-sm text-base-content/60">1 week ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div>
                      <p className="font-medium">Bought 25 shares</p>
                      <p className="text-sm text-base-content/60">Luxury Beach Villa</p>
                    </div>
                    <span className="text-sm text-base-content/60">2 weeks ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "properties" && (
          <>
            {isLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="card bg-base-100 shadow-lg border border-base-300 animate-pulse">
                    <div className="card-body">
                      <div className="h-6 bg-base-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-base-300 rounded w-1/2 mb-4"></div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="h-4 bg-base-300 rounded"></div>
                        <div className="h-4 bg-base-300 rounded"></div>
                        <div className="h-4 bg-base-300 rounded"></div>
                        <div className="h-4 bg-base-300 rounded"></div>
                      </div>
                      <div className="h-8 bg-base-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⚠️</div>
                <p className="text-error mb-4">{error}</p>
                <button className="btn btn-primary" onClick={loadUserData}>
                  Try Again
                </button>
              </div>
            )}

            {!isLoading && !error && userProperties.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-base-content mb-2">No properties yet</h3>
                <p className="text-base-content/60 mb-4">Start investing in tokenized real estate</p>
                <button
                  className="btn btn-primary"
                  onClick={() => router.push('/marketplace')}
                >
                  <PlusIcon className="h-5 w-5" />
                  Browse Properties
                </button>
              </div>
            )}

            {!isLoading && !error && userProperties.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userProperties.map((property) => (
              <div key={property.id} className="card bg-base-100 shadow-lg border border-base-300">
                <div className="card-body">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="card-title text-lg">{property.title}</h3>
                      <p className="text-sm text-base-content/60">{property.location}</p>
                    </div>
                    <button className="btn btn-ghost btn-sm">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-base-content/60">Shares Owned</p>
                      <p className="font-semibold">{property.sharesOwned}/{property.totalShares}</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">Ownership</p>
                      <p className="font-semibold">{((property.sharesOwned / property.totalShares) * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">Current Value</p>
                      <p className="font-semibold">{property.currentValue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">ROI</p>
                      <p className="font-semibold text-success">{property.roi}</p>
                    </div>
                  </div>

                  <div className="bg-base-200 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Income:</span>
                      <span className="font-medium text-secondary">{property.monthlyIncome} USD</span>
                    </div>
                  </div>
                </div>
              </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "transactions" && (
          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body">
              <h3 className="card-title mb-4">Transaction History</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Property</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>2024-01-15</td>
                      <td>
                        <div className="badge badge-primary">Purchase</div>
                      </td>
                      <td>Modern Downtown Apartment</td>
                      <td>0.15 ETH</td>
                      <td>
                        <div className="badge badge-success">Completed</div>
                      </td>
                    </tr>
                    <tr>
                      <td>2024-01-10</td>
                      <td>
                        <div className="badge badge-secondary">Dividend</div>
                      </td>
                      <td>Luxury Beach Villa</td>
                      <td>0.02 ETH</td>
                      <td>
                        <div className="badge badge-success">Completed</div>
                      </td>
                    </tr>
                    <tr>
                      <td>2024-01-05</td>
                      <td>
                        <div className="badge badge-primary">Purchase</div>
                      </td>
                      <td>Luxury Beach Villa</td>
                      <td>0.2 ETH</td>
                      <td>
                        <div className="badge badge-success">Completed</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;