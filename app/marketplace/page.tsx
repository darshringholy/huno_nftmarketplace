import FeaturedBanner from "@/components/marketplace/featured-banner"
import HotCollections from "@/components/marketplace/hot-collections"
import HotAuctions from "@/components/marketplace/hot-auctions"
import DiscoverSection from "@/components/marketplace/discover-section"
import NewsletterSection from "@/components/marketplace/newsletter-section"

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <FeaturedBanner />
      <HotCollections />
      <HotAuctions />
      <DiscoverSection />
      <NewsletterSection />
    </div>
  )
}
