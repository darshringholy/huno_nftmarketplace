'use client'
import { useEffect, useState } from "react"
import ProfileHero from "@/components/profile/profile-hero"
import ProfileContent from "@/components/profile/profile-content"
import NewsletterSection from "@/components/marketplace/newsletter-section"
import { useWallet } from "@/hooks/use-wallet"

// Mock profile data - in real app this would come from API/database
const getProfileData = (address: string) => {
  return {
    address: address,
    username: "Chihiro",
    bio: "Chihiro - the one of first #EUMOBA #NFTgames, where you can enjoy this freely gameplay as well as earning money system.",
    bannerImage: "/placeholder.svg?height=300&width=1200",
    avatarImage: "/placeholder.svg?height=120&width=120",
    socialLinks: {
      twitter: "https://twitter.com/chihiro",
      instagram: "https://instagram.com/chihiro",
      discord: "https://discord.gg/chihiro",
      website: "https://chihiro.com",
    },
    stats: {
      items: 156,
      collections: 12,
      followers: 1234,
      following: 567,
    },
  }
}

export default function ProfilePage() {
  const { address } = useWallet()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const profile = getProfileData(address || "")

  return (
    <div>
      <ProfileHero profile={profile} />
      <div className="container mx-auto px-4">
        <ProfileContent profile={profile} />
      </div>
      <NewsletterSection />
    </div>
  )
}
