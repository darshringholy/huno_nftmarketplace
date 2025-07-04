'use client'
import CollectionActivities from "@/components/marketplace/collection/collection-activities"
import CollectionDetail from "@/components/marketplace/collection/collection-detail"
import MoreFromAbstracts from "@/components/marketplace/collection/more-abstracts"
import MoreFromSellers from "@/components/marketplace/collection/more-seller"
import NewsletterSection from "@/components/marketplace/newsletter-section"


export default function CollectionDetailsPage() {


  return (

    <div className="container mx-auto px-4">
      <CollectionDetail />
      <CollectionActivities />
      <MoreFromAbstracts />
      <MoreFromSellers />
      <NewsletterSection />
    </div>
  )
}
