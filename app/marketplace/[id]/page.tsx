"use client";

import dynamic from 'next/dynamic';
import type { NextPage } from "next";

// Dynamically import the client component with no SSR
const PropertyDetailClient = dynamic(() => import('./client-component'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="text-base-content/60">Loading property details...</p>
      </div>
    </div>
  )
});

const PropertyDetail: NextPage = () => {
  return <PropertyDetailClient />;
};

export default PropertyDetail;