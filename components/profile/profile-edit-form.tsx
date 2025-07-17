"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet";

interface ProfileData {
  username: string
  bio: string
  avatar: File | null
  coverImage: File | null
  socialLinks: {
    twitter: string
    youtube: string
    instagram: string
    homepage: string
    discord: string
    website: string
  }
}

export default function ProfileEditForm() {
  const { address, isConnected } = useWallet();
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    bio: "",
    avatar: null,
    coverImage: null,
    socialLinks: {
      twitter: "",
      youtube: "",
      instagram: "",
      homepage: "",
      discord: "",
      website: "",
    },
  })

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const res = await fetch(`/api/profile?address=${address}`);
        if (!res.ok) return;
        const { profile } = await res.json();
        setProfileData((prev) => ({
          ...prev,
          ...profile,
          bio: profile.bio || profile.intro || "",
          avatar: null, // Don't set File object
          coverImage: null,
          socialLinks: {
            twitter: profile.socialLinks?.twitter || "",
            youtube: profile.socialLinks?.youtube || "",
            instagram: profile.socialLinks?.instagram || "",
            homepage: profile.socialLinks?.homepage || profile.socialLinks?.website || "",
            discord: profile.socialLinks?.discord || "",
            website: profile.socialLinks?.website || profile.socialLinks?.homepage || "",
          },
        }));
        if (profile.avatar) setAvatarPreview(profile.avatar);
        if (profile.coverImage) setCoverPreview(profile.coverImage);
      } catch {}
    })();
  }, [address]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("socialLinks.")) {
      const socialField = field.split(".")[1]
      setProfileData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value,
        },
      }))
    } else {
      setProfileData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleFileUpload = (type: "avatar" | "coverImage", file: File) => {
    setProfileData((prev) => ({
      ...prev,
      [type]: file,
    }))

    const reader = new FileReader()
    reader.onload = (e) => {
      if (type === "avatar") {
        setAvatarPreview(e.target?.result as string)
      } else {
        setCoverPreview(e.target?.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (type: "avatar" | "coverImage", event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(type, file)
    }
  }

  const handleDrop = (type: "avatar" | "coverImage", event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      handleFileUpload(type, file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const removeImage = (type: "avatar" | "coverImage") => {
    setProfileData((prev) => ({
      ...prev,
      [type]: null,
    }))
    if (type === "avatar") {
      setAvatarPreview(null)
      // Reset avatar file input value
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ""
      }
    } else {
      setCoverPreview(null)
      // Reset cover image file input value
      if (coverInputRef.current) {
        coverInputRef.current.value = ""
      }
    }
  }

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload image");
    const data = await res.json();
    return data.url as string;
  };

  const handleSave = async () => {
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!address) throw new Error("Wallet not connected");
      let avatarUrl = avatarPreview;
      let coverUrl = coverPreview;
      if (profileData.avatar instanceof File) {
        avatarUrl = await uploadImage(profileData.avatar);
      }
      if (profileData.coverImage instanceof File) {
        coverUrl = await uploadImage(profileData.coverImage);
      }
      const saveData = {
        ...profileData,
        intro: undefined, // Remove intro if present
        avatar: avatarUrl,
        coverImage: coverUrl,
        address,
        socialLinks: {
          ...profileData.socialLinks,
          website: profileData.socialLinks.website || profileData.socialLinks.homepage,
          homepage: profileData.socialLinks.homepage || profileData.socialLinks.website,
        },
      };
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveData),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      setSuccess("Profile saved successfully!");
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Images */}
        <div className="space-y-8">
          {/* Avatar Section */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <h2 className="text-xl text-white font-semibold mb-4">Avatar</h2>

              <div
                className="relative border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors"
                onDrop={(e) => handleDrop("avatar", e)}
                onDragOver={handleDragOver}
              >
                {avatarPreview ? (
                  <div className="relative">
                    <img
                      src={avatarPreview || "/placeholder.svg"}
                      alt="Avatar preview"
                      className="w-32 h-32 rounded-full mx-auto object-cover"
                    />
                    <Button
                      onClick={() => removeImage("avatar")}
                      className="absolute top-0 right-1/2 transform translate-x-16 -translate-y-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      className="mt-4 bg-green-500 hover:bg-green-600 text-black font-semibold"
                      onClick={() => document.getElementById("avatar-input")?.click()}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-300 mb-2">Drag and drop an image</p>
                      <p className="text-gray-500 text-sm">JPG or PNG, 1500x1500px</p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                      onClick={() => document.getElementById("avatar-input")?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
                <input
                  id="avatar-input"
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => handleFileInputChange("avatar", e)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cover Image Section */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <h2 className="text-xl text-white font-semibold mb-4">Cover image</h2>

              <div
                className="relative border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors min-h-[200px] flex items-center justify-center"
                onDrop={(e) => handleDrop("coverImage", e)}
                onDragOver={handleDragOver}
              >
                {coverPreview ? (
                  <div className="relative w-full">
                    <img
                      src={coverPreview || "/placeholder.svg"}
                      alt="Cover preview"
                      className="w-full h-48 rounded-lg object-cover"
                    />
                    <Button
                      onClick={() => removeImage("coverImage")}
                      className="absolute top-2 right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-300 mb-2">Drag and drop an image</p>
                      <p className="text-gray-500 text-sm">JPG or PNG, 1500x400px</p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                      onClick={() => document.getElementById("cover-input")?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
                <input
                  id="cover-input"
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => handleFileInputChange("coverImage", e)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Information */}
        <div className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <h2 className="text-xl text-white font-semibold mb-4">Basic information</h2>

              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  You can choose a NFT from <span className="text-green-400 font-semibold">My NFTs</span> as your
                  avatar, and your user name will be <span className="text-green-400 font-semibold">Rainbowized</span>{" "}
                  when used.
                </p>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Username</label>
                  <Input
                    placeholder="Your username"
                    value={profileData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Bio</label>
                  <Textarea
                    placeholder="Tell us about yourself..."
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[120px] resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <h2 className="text-xl text-white font-semibold mb-4">Social links</h2>

              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  You would have more control of your personal information exposed by providing social links on your
                  profile page. If you are an influencer with more than{" "}
                  <span className="text-white font-semibold">10K followers</span>, you can contact us to{" "}
                  <span className="text-green-400 font-semibold">verify your account</span>.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Twitter</label>
                    <Input
                      placeholder="https://twitter.com/"
                      value={profileData.socialLinks.twitter}
                      onChange={(e) => handleInputChange("socialLinks.twitter", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Youtube</label>
                    <Input
                      placeholder="https://www.youtube.com/"
                      value={profileData.socialLinks.youtube}
                      onChange={(e) => handleInputChange("socialLinks.youtube", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Instagram</label>
                    <Input
                      placeholder="https://www.instagram.com/"
                      value={profileData.socialLinks.instagram}
                      onChange={(e) => handleInputChange("socialLinks.instagram", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Homepage</label>
                    <Input
                      placeholder="https://"
                      value={profileData.socialLinks.homepage}
                      onChange={(e) => handleInputChange("socialLinks.homepage", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Discord</label>
                    <Input
                      placeholder="https://discord.com/"
                      value={profileData.socialLinks.discord}
                      onChange={(e) => handleInputChange("socialLinks.discord", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Website</label>
                    <Input
                      placeholder="https://"
                      value={profileData.socialLinks.website}
                      onChange={(e) => handleInputChange("socialLinks.website", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-2" disabled={uploading}>
              {uploading ? "Saving..." : "Save"}
            </Button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
            {success && <div className="text-green-500 mt-2">{success}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
