"use client";

import CryptoChart from "@/components/ui/crypto-chart-fixed";
import MatrixBackground from "@/components/ui/matrix-background";

export default function AppPage() {
  return (
    <div className="min-h-screen bg-black relative">
      <MatrixBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <CryptoChart />
      </div>
    </div>
  );
}
