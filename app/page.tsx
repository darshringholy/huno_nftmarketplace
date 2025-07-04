import HeroSection from "@/components/home/hero-section"
import MarketplaceSection from "@/components/home/marketplace-section"
import HowItWorksSection from "@/components/home/how-it-works-section"
import CollectionSection from "@/components/home/collection-section"

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <MarketplaceSection />
      <HowItWorksSection />
      <CollectionSection />
    </div>
  )
}
