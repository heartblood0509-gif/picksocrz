'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import DestinationsSection from '@/components/sections/DestinationsSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import ShipsSection from '@/components/sections/ShipsSection';
import PackagesSection from '@/components/sections/PackagesSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/ui/Footer';
import ChatBot from '@/components/ChatBot';

// Dynamically import 3D scene to prevent SSR issues
const Scene3D = dynamic(() => import('@/components/3d/Scene3D'), {
  ssr: false,
  loading: () => null
});

export default function Home() {
  return (
    <main className="relative bg-[#030014] min-h-screen">
      {/* 3D Background Scene */}
      <Scene3D />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="relative z-10">
        <HeroSection />
        <DestinationsSection />
        <ExperienceSection />
        <ShipsSection />
        <PackagesSection />
        <ContactSection />
        <Footer />
      </div>

      {/* AI ChatBot */}
      <ChatBot />
    </main>
  );
}
