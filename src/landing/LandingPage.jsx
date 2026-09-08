import { useEffect } from 'react';
import Lenis from 'lenis';
import LandingNav from './LandingNav';
import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import CTASection from './CTASection';
import './landing.css';

export default function LandingPage() {
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let lenis;
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      const frameId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(frameId);
        lenis.destroy();
      };
    } catch {
      // Graceful fallback if Lenis fails in any context
    }
  }, []);

  return (
    <div className="landing-page min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 selection:bg-indigo-500 selection:text-white">
      <LandingNav />
      <main>
        <HeroSection />
        <FeatureSection />
        <CTASection />
      </main>
    </div>
  );
}
