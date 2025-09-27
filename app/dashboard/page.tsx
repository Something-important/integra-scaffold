"use client";

import { useState } from "react";
import type { NextPage } from "next";
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

// Mock data for user's properties and investments
const mockUserProperties = [
  {
    id: 1,
    title: "Modern Downtown Apartment",
    location: "New York, NY",
    sharesOwned: 150,
    totalShares: 1000,
    currentValue: "0.375 ETH",
    totalInvested: "0.3 ETH",
    roi: "+25%",
    monthlyIncome: "0.02 ETH"
  },
  {
    id: 2,
    title: "Luxury Beach Villa",
    location: "Miami, FL",
    sharesOwned: 75,
    totalShares: 2000,
    currentValue: "0.217 ETH",
    totalInvested: "0.2 ETH",
    roi: "+8.5%",
    monthlyIncome: "0.015 ETH"
  }
];

const mockStats = {
  totalInvested: "0.5 ETH",
  currentValue: "0.592 ETH",
  totalROI: "+18.4%",
  monthlyIncome: "0.035 ETH",
  propertiesOwned: 2
};

const Dashboard: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState("overview");

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

            <button className="btn btn-primary">
              <PlusIcon className="h-5 w-5" />
              Invest in Property
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">Total Invested</p>
                  <p className="text-2xl font-bold text-base-content">{mockStats.totalInvested}</p>
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
                  <p className="text-2xl font-bold text-base-content">{mockStats.currentValue}</p>
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
                  <p className="text-2xl font-bold text-success">{mockStats.totalROI}</p>
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
                  <p className="text-2xl font-bold text-base-content">{mockStats.monthlyIncome}</p>
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
                  <p className="text-2xl font-bold text-base-content">{mockStats.propertiesOwned}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockUserProperties.map((property) => (
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
                      <span className="font-medium text-secondary">{property.monthlyIncome}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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