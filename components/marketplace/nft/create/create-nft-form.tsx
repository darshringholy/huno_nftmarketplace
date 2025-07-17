"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Info } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useEffect } from "react"
import { LIQUIDID_ABI, LIQUIDID_ADDRESS } from "@/lib/liquidid";
import { ethers } from "ethers";

interface CreateNFTFormProps {
  type: "single" | "multiple"
  onBack: () => void
}

interface NFTFormData {
  file: File | null
  title: string
  description: string
  royalties: string
  properties: {
    name: string
    value: string
  }[]
  collection: string
}

export default function CreateNFTForm({ type, onBack }: CreateNFTFormProps) {
  const { address, isConnected } = useWallet();
  const [formData, setFormData] = useState<NFTFormData>({
    file: null,
    title: "",
    description: "",
    royalties: "10",
    properties: [{ name: "", value: "" }],
    collection: "",
  })

  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [collections, setCollections] = useState<any[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [collectionsError, setCollectionsError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return;
    setCollectionsLoading(true);
    setCollectionsError(null);
    fetch(`/api/collections?walletAddress=${address}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch collections");
        const { collections } = await res.json();
        setCollections(collections || []);
      })
      .catch((err) => setCollectionsError(err.message))
      .finally(() => setCollectionsLoading(false));
  }, [address]);

  const handleInputChange = (field: keyof NFTFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePropertyChange = (index: number, field: "name" | "value", value: string) => {
    setFormData((prev) => {
      const updatedProperties = [...prev.properties]
      updatedProperties[index] = {
        ...updatedProperties[index],
        [field]: value,
      }
      return {
        ...prev,
        properties: updatedProperties,
      }
    })
  }

  const addProperty = () => {
    setFormData((prev) => ({
      ...prev,
      properties: [...prev.properties, { name: "", value: "" }],
    }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file,
      }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadToIPFS = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    
    const response = await fetch("/api/ipfs/upload", {
      method: "POST",
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.details || "Failed to upload file to IPFS")
    }
    
    const result = await response.json()
    return result.ipfsURI
  }

  const uploadMetadataToIPFS = async (imageURI: string) => {
    const metadata = {
      name: formData.title,
      description: formData.description,
      image: imageURI,
      collection: formData.collection || "",
      attributes: formData.properties
        .filter(prop => prop.name && prop.value)
        .map(prop => ({
          trait_type: prop.name,
          value: prop.value,
        })),
      external_url: "",
      animation_url: "",
    }

    const metadataFormData = new FormData()
    metadataFormData.append("metadata", JSON.stringify(metadata))
    
    const response = await fetch("/api/ipfs/upload", {
      method: "POST",
      body: metadataFormData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.details || "Failed to upload metadata to IPFS")
    }
    
    const result = await response.json()
    return result.ipfsURI
  }

  const handleSubmit = async () => {
    if (!formData.file || !formData.title.trim()) {
      setError("Please provide a file and title")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Step 1: Upload file to IPFS
      const imageURI = await uploadToIPFS(formData.file)
      // Step 2: Upload metadata to IPFS
      const metadataURI = await uploadMetadataToIPFS(imageURI)

      // Step 3: Mint NFT on blockchain
      if (!window.ethereum) throw new Error("Wallet not connected")
      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, signer)

      // AssetType: 0 = single, 1 = multiple
      const assetType = type === "single" ? 0 : 1
      // Custom price and project token are fixed for now
      const customPrice = BigInt(0);
      const projectToken = "0x0000000000000000000000000000000000000000";

      const tx = await contract.mintAsset(metadataURI, assetType, customPrice, projectToken)
      await tx.wait()

      setSuccess("NFT created and minted successfully! Image and metadata uploaded to IPFS.")
      setFormData({
        file: null,
        title: "",
        description: "",
        royalties: "10",
        properties: [{ name: "", value: "" }],
        collection: "",
      })
      setFilePreview(null)
    } catch (err: any) {
      setError(err.message || "Failed to create NFT")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create {type === "single" ? "Single" : "Multiple"} LID</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - File Upload */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Upload file</h2>
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-0 text-center hover:border-gray-500 transition-colors min-h-[300px] flex items-center justify-center"
            onClick={() => document.getElementById("nft-file-input")?.click()}
          >
            {filePreview ? (
              <div className="w-full">
                {formData.file?.type.startsWith("image/") ? (
                  <img
                    src={filePreview || "/placeholder.svg"}
                    alt="NFT Preview"
                    className="max-h-[300px] mx-auto object-contain"
                  />
                ) : formData.file?.type.startsWith("video/") ? (
                  <video src={filePreview} controls className="max-h-[300px] w-full mx-auto object-contain"></video>
                ) : (
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <p className="text-gray-300">{formData.file?.name}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-300 mb-2">PNG, GIF, WEBP, MP4 or MP3</p>
                  <p className="text-gray-500 text-sm">Maxx 30mb</p>
                </div>
                <Button
                  variant="outline"
                  className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                >
                  Choose File
                </Button>
              </div>
            )}
            <input
              id="nft-file-input"
              type="file"
              accept="image/png,image/gif,image/webp,video/mp4,audio/mp3"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Right Column - NFT Details */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-lg font-semibold">Title</label>
            <Input
              placeholder="Enter your NFT name"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-lg font-semibold">Description</label>
            <Textarea
              placeholder="Text here"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white min-h-[120px]"
            />
          </div>

          {/* Royalties */}
          <div className="space-y-2">
            <label className="text-lg font-semibold">Royalties</label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                max="50"
                value={formData.royalties}
                onChange={(e) => handleInputChange("royalties", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white pr-8"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
            </div>
          </div>

          {/* Properties */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold">Properties (optional)</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={addProperty}
                className="text-green-500 hover:text-green-400 hover:bg-transparent"
              >
                + Add more
              </Button>
            </div>

            {formData.properties.map((property, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="e.g Size"
                  value={property.name}
                  onChange={(e) => handlePropertyChange(index, "name", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Input
                  placeholder="e.g M"
                  value={property.value}
                  onChange={(e) => handlePropertyChange(index, "value", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            ))}
          </div>

          {/* Collection */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="text-lg font-semibold">Collection</label>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">This is the collection where your item will appear</p>
            {collectionsLoading ? (
              <div className="text-gray-400 text-sm">Loading collections...</div>
            ) : collectionsError ? (
              <div className="text-red-500 text-sm">{collectionsError}</div>
            ) : collections.length === 0 ? (
              <div className="text-gray-400 text-sm">No collections found. <a href='/marketplace/collections/create' className='text-green-400 underline'>Create one</a>.</div>
            ) : (
              <Select value={formData.collection} onValueChange={(value) => handleInputChange("collection", value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {collections.map((col) => (
                    <SelectItem key={col._id} value={col._id}>{col.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Create Button */}
          <div className="pt-6 flex flex-col space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-8 py-3 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create NFT"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
