"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Twitter, Instagram, MessageCircle, Globe } from "lucide-react"
import { useState } from "react"
import ShareButton from "@/components/ui/share-button"
import EditButton from "@/components/ui/edit-button"

interface Profile {
  address: string
  username: string
  bio: string
  bannerImage: string
  avatarImage: string
  socialLinks: {
    twitter: string
    instagram: string
    discord: string
    website: string
  }
  stats: {
    items: number
    collections: number
    followers: number
    following: number
  }
}

interface ProfileHeroProps {
  profile: Profile
}

export default function ProfileHero({ profile }: ProfileHeroProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard && profile.address) {
      try {
        await navigator.clipboard.writeText(profile.address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (e) {
        setCopied(false)
      }
    }
  }

  const handleProfileEdit = () => {
    console.log("Edit profile clicked")
    // Navigate to profile edit page or open edit modal
    window.location.href = "/profile/edit"
  }

  const handleSettingsEdit = () => {
    console.log("Settings clicked")
    // Navigate to settings page or open settings modal
    window.location.href = "/settings"
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <section className="relative">
      {/* Banner Image */}
      <div className="h-80 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Profile Info */}
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col items-center text-center -mt-16 relative z-10">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-black mb-6 flex items-center justify-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
          </div>

          {/* Username */}
          <h1 className="text-3xl font-bold mb-4">{profile.username}</h1>

          {/* Social Links */}
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Twitter className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Instagram className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Globe className="w-5 h-5" />
            </Button>
          </div>

          {/* Bio */}
          <p className="text-gray-400 max-w-2xl leading-relaxed mb-6">{profile.bio}</p>

          {/* Address and Actions */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-4 py-2">
              <span className="text-sm font-mono">{formatAddress(profile.address)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                disabled={!profile.address}
                title={!profile.address ? 'No address to copy' : 'Copy address'}
              >
                <Copy className="w-4 h-4" />
              </Button>
              {copied && profile.address && <Badge className="bg-green-500 text-black text-xs">Copied!</Badge>}
            </div>

            <ShareButton
              title={`${profile.username}'s Profile`}
              description={profile.bio}
              variant="outline"
              size="sm"
              className="border-gray-700"
            />
            <EditButton
              onProfileEdit={handleProfileEdit}
              onSettingsEdit={handleSettingsEdit}
              variant="outline"
              size="sm"
              className="border-gray-700"
            />

          </div>
        </div>
      </div>
    </section>
  )
}
