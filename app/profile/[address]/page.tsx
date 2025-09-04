'use client'
import { useEffect, useState, use } from "react"
import ProfileHero from "@/components/profile/profile-hero"
import ProfileContent from "@/components/profile/profile-content"
import NewsletterSection from "@/components/marketplace/newsletter-section"
import { useSearchParams } from "next/navigation";

// Mock profile data - in real app this would come from API/database
const getProfileData = (address: string) => {
  return {
    address: address,
    username: "Chihiro",
    bio: "Chihiro - the one of first #EUMOBA #LIDgames, where you can enjoy this freely gameplay as well as earning money system.",
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

export default function PublicProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || undefined;
  
  // Unwrap params using React.use()
  const { address } = use(params);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    fetch(`/api/profile?address=${address}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Profile not found");
        const { profile } = await res.json();
        // Normalize fields for display components
        setProfile({
          address: profile.address,
          username: profile.username || "",
          bio: profile.bio || profile.intro || "",
          bannerImage: profile.coverImage || profile.bannerImage || "/placeholder.svg?height=300&width=1200",
          avatarImage: profile.avatar || profile.avatarImage || "/placeholder.svg?height=120&width=120",
          socialLinks: {
            twitter: profile.socialLinks?.twitter || "",
            instagram: profile.socialLinks?.instagram || "",
            discord: profile.socialLinks?.discord || "",
            website: profile.socialLinks?.homepage || profile.socialLinks?.website || "",
          },
          stats: profile.stats || { items: 0, collections: 0, followers: 0, following: 0 },
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [address]);

  if (!mounted) return null;
  if (loading) return <div className="text-center py-8">Loading profile...</div>;
  if (error && error !== "Profile not found") return <div className="text-center text-red-500 py-8">{error}</div>;

  // Placeholder profile if not found
  const displayProfile = profile || {
    address: address || "",
    username: "",
    bio: "",
    bannerImage: "/placeholder.svg?height=300&width=1200",
    avatarImage: "/placeholder.svg?height=120&width=120",
    socialLinks: {
      twitter: "",
      instagram: "",
      discord: "",
      website: "",
    },
    stats: { items: 0, collections: 0, followers: 0, following: 0 },
  };

  return (
    <>
      <div>
        <ProfileHero profile={displayProfile} isPublic={true} />
        <div className="container mx-auto px-4">
          <ProfileContent profile={displayProfile} defaultTab={tab} isPublic={true} />
        </div>
      </div>
      <NewsletterSection />
    </>
  );
} 