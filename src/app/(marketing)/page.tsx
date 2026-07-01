import Nav from '@/components/marketing/Nav';
import Hero from '@/components/marketing/Hero';
import Comparison from '@/components/marketing/Comparison';
import Features from '@/components/marketing/Features';
import HowItWorks from '@/components/marketing/HowItWorks';
import Pricing from '@/components/marketing/Pricing';
import TrustBar from '@/components/marketing/TrustBar';
import Footer from '@/components/marketing/Footer';

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <Comparison />
        <Features />
        <HowItWorks />
        <Pricing />
        <TrustBar />
      </main>
      <Footer />
    </>
  );
}
