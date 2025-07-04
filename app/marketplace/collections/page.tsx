import CollectionHero from "@/components/marketplace/collection/collection-hero"
import CollectionStats from "@/components/marketplace/collection/collection-stats"
import CollectionContent from "@/components/marketplace/collection/collection-content"
import NewsletterSection from "@/components/marketplace/newsletter-section"

// Mock collection data - in real app this would come from API/database
const getCollectionData = () => {
  return {
    id: "doodle-apes",
    name: "Doodle Apes",
    description:
      "Doodle Apes are beautifully animated digital collectibles with varying scarcities. Each Doodle Apes is backed by a truly unique LID and can be unpacked with $HUNOS tokens.",
    verified: true,
    bannerImage: "/placeholder.svg?height=400&width=1200",
    avatarImage: "/placeholder.svg?height=120&width=120",
    stats: {
      traded: "65,307",
      players: "11,923",
      listed: "26,328",
      floorPrice: "5.06K",
    },
  }
}

export default function CollectionsPage() {
  const collection = getCollectionData()

  return (
    <div>
      <CollectionHero collection={collection} />
      <CollectionStats stats={collection.stats} />
      <div className="container mx-auto px-4">
        <CollectionContent />
      </div>
      <NewsletterSection />
    </div>
  )
}
