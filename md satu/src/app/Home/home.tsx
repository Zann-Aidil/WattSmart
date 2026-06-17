"use client";

import { LandingNavbar } from "@/src/components/Landing/LandingNavbar";
import { HeroSection } from "@/src/components/Landing/HeroSection";
import { WhyUsSection } from "@/src/components/Landing/WhyUsSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <LandingNavbar />
      <HeroSection />
      <WhyUsSection />
      {/* Footer can be added here later */}
    </div>
  );
}