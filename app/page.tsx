
"use client";

import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import type { NextPage } from "next";
import Link from "next/link";
import { BuildingStorefrontIcon, ChartBarIcon, UserIcon } from "@heroicons/react/24/outline";


const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow">
        {/* Hero Section */}
        <div className="hero min-h-[60vh] bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="hero-content text-center">
            <div className="max-w-4xl">
              <div className="mb-8">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
                  Integra DApp
                </h1>
                <p className="text-xl lg:text-2xl font-medium text-base-content/80 mb-8 max-w-2xl mx-auto">
                  Invest in tokenized real estate properties and track your portfolio
                </p>

                {connectedAddress && (
                  <div className="flex justify-center items-center gap-3 mb-6">
                    <div className="badge badge-success gap-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                      Connected
                    </div>
                    <Address address={connectedAddress} />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/marketplace" className="btn btn-primary btn-lg">
                    <BuildingStorefrontIcon className="h-5 w-5" />
                    Explore Properties
                  </Link>
                  <Link href="/dashboard" className="btn btn-outline btn-lg">
                    <ChartBarIcon className="h-5 w-5" />
                    View Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full px-4 py-16 bg-base-200/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-base-content mb-4">
                Platform Features
              </h2>
              <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                Everything you need to invest in and manage tokenized real estate properties
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Marketplace Card */}
              <div className="group">
                <Link href="/marketplace" className="block h-full">
                  <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border border-base-300 h-full">
                    <div className="card-body text-center">
                      <div className="mx-auto mb-6 p-4 bg-primary/10 rounded-full w-fit">
                        <BuildingStorefrontIcon className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="card-title justify-center text-xl mb-3">Property Marketplace</h3>
                      <p className="text-base-content/70 flex-grow">
                        Browse and invest in tokenized real estate properties. Buy shares in premium properties from around the world.
                      </p>
                      <div className="card-actions justify-center mt-4">
                        <div className="btn btn-ghost btn-sm group-hover:btn-primary transition-colors">
                          Explore Properties
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Dashboard Card */}
              <div className="group">
                <Link href="/dashboard" className="block h-full">
                  <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border border-base-300 h-full">
                    <div className="card-body text-center">
                      <div className="mx-auto mb-6 p-4 bg-secondary/10 rounded-full w-fit">
                        <ChartBarIcon className="h-12 w-12 text-secondary" />
                      </div>
                      <h3 className="card-title justify-center text-xl mb-3">Investment Dashboard</h3>
                      <p className="text-base-content/70 flex-grow">
                        Track your property investments, monitor returns, and manage your real estate portfolio all in one place.
                      </p>
                      <div className="card-actions justify-center mt-4">
                        <div className="btn btn-ghost btn-sm group-hover:btn-secondary transition-colors">
                          View Dashboard
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Profile Card */}
              <div className="group">
                <Link href="/profile" className="block h-full">
                  <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border border-base-300 h-full">
                    <div className="card-body text-center">
                      <div className="mx-auto mb-6 p-4 bg-accent/10 rounded-full w-fit">
                        <UserIcon className="h-12 w-12 text-accent" />
                      </div>
                      <h3 className="card-title justify-center text-xl mb-3">User Profile</h3>
                      <p className="text-base-content/70 flex-grow">
                        Manage your profile information and verify your identity with secure wallet-based authentication.
                      </p>
                      <div className="card-actions justify-center mt-4">
                        <div className="btn btn-ghost btn-sm group-hover:btn-accent transition-colors">
                          Manage Profile
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
