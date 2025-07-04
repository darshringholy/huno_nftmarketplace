"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X } from "lucide-react"

interface VerificationFormData {
  logoImage: File | null
  bannerImage: File | null
  collectionName: string
  contractAddress: string
  blockchain: string
  website: string
  twitterLink: string
  twitterFollowers: string
  telegramLink: string
  telegramMembers: string
  discordLink: string
  discordMembers: string
  mediumLink: string
  facebookLink: string
  projectDescription: string
  royaltyFee: string
  nftMetadata: string
  contactMethod: string
}

export default function CollectionVerificationForm() {
  const [formData, setFormData] = useState<VerificationFormData>({
    logoImage: null,
    bannerImage: null,
    collectionName: "",
    contractAddress: "",
    blockchain: "bnb",
    website: "",
    twitterLink: "",
    twitterFollowers: "",
    telegramLink: "",
    telegramMembers: "",
    discordLink: "",
    discordMembers: "",
    mediumLink: "",
    facebookLink: "",
    projectDescription: "",
    royaltyFee: "no-thanks",
    nftMetadata: "",
    contactMethod: "",
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  const handleInputChange = (field: keyof VerificationFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileUpload = (type: "logoImage" | "bannerImage", file: File) => {
    setFormData((prev) => ({
      ...prev,
      [type]: file,
    }))

    const reader = new FileReader()
    reader.onload = (e) => {
      if (type === "logoImage") {
        setLogoPreview(e.target?.result as string)
      } else {
        setBannerPreview(e.target?.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (type: "logoImage" | "bannerImage", event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(type, file)
    }
  }

  const handleDrop = (type: "logoImage" | "bannerImage", event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      handleFileUpload(type, file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const removeImage = (type: "logoImage" | "bannerImage") => {
    setFormData((prev) => ({
      ...prev,
      [type]: null,
    }))
    if (type === "logoImage") {
      setLogoPreview(null)
    } else {
      setBannerPreview(null)
    }
  }

  const handleSubmit = () => {
    console.log("Submitting verification form:", formData)
    // Implement form submission logic
  }

  return (
    <div className="mx-auto space-y-8">
      {/* Header Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h1 className="text-3xl font-bold mb-4">Apply for Collection Verification</h1>
          <div className="space-y-4 text-gray-400">
            <p>NFT collection as NFT-Bloc Partners enjoys benefits like:</p>
            <ul className="space-y-1">
              <li>• Verified Mark</li>
              <li>• Attribute Filter</li>
            </ul>
            <p>
              For NFTs with non-standard metadata, we also provide manual support for converting them to displayable
              format.
            </p>
            <p>Fill in the form and we will contact you later.</p>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
          {/* Logo Image */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">
              Logo Image <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-gray-400">This image will also be used for navigation.</p>

            <div
              className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors min-h-[200px] flex items-center justify-center"
              onDrop={(e) => handleDrop("logoImage", e)}
              onDragOver={handleDragOver}
            >
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview || "/placeholder.svg"}
                    alt="Logo preview"
                    className="w-32 h-32 rounded-lg object-cover mx-auto"
                  />
                  <Button
                    onClick={() => removeImage("logoImage")}
                    className="absolute top-0 right-0 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-300 mb-2">Drag and drop an image</p>
                    <p className="text-gray-500 text-sm">JPG or PNG, 350x350px</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                    onClick={() => document.getElementById("logo-input")?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
              <input
                id="logo-input"
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => handleFileInputChange("logoImage", e)}
              />
            </div>
          </div>

          {/* Banner Image */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">
              Banner Image <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-gray-400">This image will also be used for navigation.</p>

            <div
              className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors min-h-[200px] flex items-center justify-center"
              onDrop={(e) => handleDrop("bannerImage", e)}
              onDragOver={handleDragOver}
            >
              {bannerPreview ? (
                <div className="relative w-full">
                  <img
                    src={bannerPreview || "/placeholder.svg"}
                    alt="Banner preview"
                    className="w-full h-32 rounded-lg object-cover"
                  />
                  <Button
                    onClick={() => removeImage("bannerImage")}
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
                    <p className="text-gray-500 text-sm">JPG or PNG, 1800x400px</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                    onClick={() => document.getElementById("banner-input")?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
              <input
                id="banner-input"
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => handleFileInputChange("bannerImage", e)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Sections */}
      <Card className="bg-transparent border-gray-800">
        <CardContent className="p-6 space-y-8">
          {/* About your Collection */}
          <div className="space-y-6">
            <h2 className="text-xl text-white font-semibold">About your Collection</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">
                  Collection's name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.collectionName}
                  onChange={(e) => handleInputChange("collectionName", e.target.value)}
                  className="bg-transparent border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">
                  Contract address of the NFT <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.contractAddress}
                  onChange={(e) => handleInputChange("contractAddress", e.target.value)}
                  className="bg-transparent border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Tell us more about your project</label>
                <Textarea
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange("projectDescription", e.target.value)}
                  className="bg-transparent border-gray-700 text-white min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Which Blockchain is Your Project on?</label>
                <Select value={formData.blockchain} onValueChange={(value) => handleInputChange("blockchain", value)}>
                  <SelectTrigger className="bg-transparent border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-transparent border-gray-700 text-white">
                    <SelectItem value="bnb">BNB Chain</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Links and description */}
          <div className="space-y-6">
            <h2 className="text-xl text-white font-semibold">Links and description to display on your Collection page</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Website *</label>
                <Input
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="bg-transparent border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Twitter link</label>
                <Input
                  value={formData.twitterLink}
                  onChange={(e) => handleInputChange("twitterLink", e.target.value)}
                  className="bg-transparent border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Twitter followers (e.g. 14k)</label>
                <Input
                  value={formData.twitterFollowers}
                  onChange={(e) => handleInputChange("twitterFollowers", e.target.value)}
                  className="bg-transparent border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Telegram group link</label>
                <Input
                  value={formData.telegramLink}
                  onChange={(e) => handleInputChange("telegramLink", e.target.value)}
                  className="bg-transparent border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Telegram members</label>
                <Input
                  value={formData.telegramMembers}
                  onChange={(e) => handleInputChange("telegramMembers", e.target.value)}
                  className="bg-transparent border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Discord server link</label>
                <Input
                  value={formData.discordLink}
                  onChange={(e) => handleInputChange("discordLink", e.target.value)}
                  className="bg-transparent border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Discord members</label>
                <Input
                  value={formData.discordMembers}
                  onChange={(e) => handleInputChange("discordMembers", e.target.value)}
                  className="bg-transparent border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Medium link</label>
                <Input
                  value={formData.mediumLink}
                  onChange={(e) => handleInputChange("mediumLink", e.target.value)}
                  className="bg-transparent border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Facebook link</label>
                <Input
                  value={formData.facebookLink}
                  onChange={(e) => handleInputChange("facebookLink", e.target.value)}
                  className="bg-transparent border-gray-700 text-white"
                />
              </div>
            </div>
          </div>

          {/* Royalty Fee */}
          <div className="space-y-4">
            <h2 className="text-xl text-white font-semibold">Royalty Fee</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Do you want a Royalty fee distribution?</label>
              <Select value={formData.royaltyFee} onValueChange={(value) => handleInputChange("royaltyFee", value)}>
                <SelectTrigger className="bg-black border-gray-700 text-white max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700 text-white">
                  <SelectItem value="no-thanks">No, thanks</SelectItem>
                  <SelectItem value="yes-2-5">Yes, 2.5%</SelectItem>
                  <SelectItem value="yes-5">Yes, 5%</SelectItem>
                  <SelectItem value="yes-7-5">Yes, 7.5%</SelectItem>
                  <SelectItem value="yes-10">Yes, 10%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* NFT's metadata */}
          <div className="space-y-4">
            <h2 className="text-xl text-white font-semibold">NFT's metadata</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">
                Is your NFT's metadata json accessible from tokenURI contract method?
              </label>
              <Select value={formData.nftMetadata} onValueChange={(value) => handleInputChange("nftMetadata", value)}>
                <SelectTrigger className="bg-black border-gray-700 text-white max-w-md">
                  <SelectValue placeholder="-- Select an option --" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700 text-white">
                  <SelectItem value="yes">Yes, it's accessible</SelectItem>
                  <SelectItem value="no">No, it's not accessible</SelectItem>
                  <SelectItem value="partial">Partially accessible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="text-xl text-white font-semibold">Contact</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">
                How can we contact you? <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.contactMethod}
                onValueChange={(value) => handleInputChange("contactMethod", value)}
              >
                <SelectTrigger className="bg-black border-gray-700 text-white max-w-md">
                  <SelectValue placeholder="-- Select an option --" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700 text-white">
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-3">
          Submit
        </Button>
      </div>
    </div>
  )
}
