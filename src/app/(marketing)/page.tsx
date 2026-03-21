import Nav from '@/components/marketing/Nav';
import Hero from '@/components/marketing/Hero';
import Features from '@/components/marketing/Features';
import Pricing from '@/components/marketing/Pricing';
import TrustBar from '@/components/marketing/TrustBar';
import Footer from '@/components/marketing/Footer';
import CookieBanner from '@/components/marketing/CookieBanner';

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <TrustBar />
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
