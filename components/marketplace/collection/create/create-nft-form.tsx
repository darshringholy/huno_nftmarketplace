"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Info } from "lucide-react"

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
  const [formData, setFormData] = useState<NFTFormData>({
    file: null,
    title: "",
    description: "",
    royalties: "10",
    properties: [{ name: "", value: "" }],
    collection: "",
  })

  const [filePreview, setFilePreview] = useState<string | null>(null)

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

  const handleSubmit = () => {
    console.log("Creating NFT:", formData)
    // Implement NFT creation logic
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create {type === "single" ? "Single" : "Multiple"} NFT</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - File Upload */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Upload file</h2>
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors min-h-[300px] flex items-center justify-center"
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
            <Select value={formData.collection} onValueChange={(value) => handleInputChange("collection", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="abstract">Abstract</SelectItem>
                <SelectItem value="genesis">Genesis Collection</SelectItem>
                <SelectItem value="nature">Nature Collection</SelectItem>
                <SelectItem value="tech">Tech Collection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create Button */}
          <div className="pt-6 flex justify-end">
            <Button onClick={handleSubmit} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-8 py-3">
              Create NFT
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
