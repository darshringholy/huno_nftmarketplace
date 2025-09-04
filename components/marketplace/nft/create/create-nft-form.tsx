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

// Hunos token address and ABI
const HUNOS_TOKEN_ADDRESS = "0x957F6F0732f1c45bD7694614875b6a5Eb0bF5ac2";
const HUNOS_TOKEN_ABI = [
  {"inputs":[{"internalType":"address","name":"initialOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[],"name":"ECDSAInvalidSignature","type":"error"},
  {"inputs":[{"internalType":"uint256","name":"length","type":"uint256"}],"name":"ECDSAInvalidSignatureLength","type":"error"},
  {"inputs":[{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"ECDSAInvalidSignatureS","type":"error"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},
  {"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},
  {"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},
  {"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},
  {"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},
  {"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"ERC2612ExpiredSignature","type":"error"},
  {"inputs":[{"internalType":"address","name":"signer","type":"address"},{"internalType":"address","name":"owner","type":"address"}],"name":"ERC2612InvalidSigner","type":"error"},
  {"inputs":[],"name":"EnforcedPause","type":"error"},
  {"inputs":[],"name":"ExpectedPause","type":"error"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"currentNonce","type":"uint256"}],"name":"InvalidAccountNonce","type":"error"},
  {"inputs":[],"name":"InvalidShortString","type":"error"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
  {"inputs":[{"internalType":"string","name":"str","type":"string"}],"name":"StringTooLong","type":"error"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[],"name":"EIP712DomainChanged","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"}],"name":"MinterAdded","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"}],"name":"MinterRemoved","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},
  {"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"INITIAL_SUPPLY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"MAX_SUPPLY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"addMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burnFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"eip712Domain","outputs":[{"internalType":"bytes1","name":"fields","type":"bytes1"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"version","type":"string"},{"internalType":"uint256","name":"chainId","type":"uint256"},{"internalType":"address","name":"verifyingContract","type":"address"},{"internalType":"bytes32","name":"salt","type":"bytes32"},{"internalType":"uint256[]","name":"extensions","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"minters","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"removeMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

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
    setCollectionsLoading(true);
    setCollectionsError(null);
    fetch(`/api/collections`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch collections");
        const { collections } = await res.json();
        setCollections(collections || []);
      })
      .catch((err) => setCollectionsError(err.message))
      .finally(() => setCollectionsLoading(false));
  }, []);

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
      
            // Step 2.5: Check token balance and handle approval
      if (!window.ethereum) throw new Error("Wallet not connected")
      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      const hunosToken = new ethers.Contract(HUNOS_TOKEN_ADDRESS, HUNOS_TOKEN_ABI, signer)
      
      try {
        // Check user's Hunos token balance first
        const userAddress = await signer.getAddress()
        const userBalance = await hunosToken.balanceOf(userAddress)
        const requiredAmount = ethers.parseUnits("50", 18)
        
        if (userBalance < requiredAmount) {
          throw new Error(`Insufficient Hunos tokens. You have ${ethers.formatUnits(userBalance, 18)} tokens, but need 50 tokens to create a LID.`)
        }
        
        console.log(`User has ${ethers.formatUnits(userBalance, 18)} Hunos tokens`)
        
        // Check current allowance
        const currentAllowance = await hunosToken.allowance(userAddress, LIQUIDID_ADDRESS)
        console.log(`Current allowance: ${ethers.formatUnits(currentAllowance, 18)} tokens`)
        
        // Only approve if current allowance is less than required amount
        if (currentAllowance < requiredAmount) {
          console.log("Insufficient allowance, attempting approval...")
          
          // Try approval with different gas settings
          try {
            const approveTx = await hunosToken.approve(LIQUIDID_ADDRESS, requiredAmount, {
              gasLimit: 150000 // Higher gas limit
            })
            await approveTx.wait()
            console.log("Hunos tokens approved successfully")
          } catch (approveError: any) {
            console.error("Approval failed with gas limit, trying without gas limit:", approveError)
            
            // Try without explicit gas limit
            try {
              const approveTx = await hunosToken.approve(LIQUIDID_ADDRESS, requiredAmount)
              await approveTx.wait()
              console.log("Hunos tokens approved successfully (without gas limit)")
            } catch (secondApproveError: any) {
              console.error("Second approval attempt failed:", secondApproveError)
              
              // Check if allowance was updated despite error
              const updatedAllowance = await hunosToken.allowance(userAddress, LIQUIDID_ADDRESS)
              if (updatedAllowance >= requiredAmount) {
                console.log("Allowance was updated despite error, proceeding...")
              } else {
                console.log("Approval failed completely, continuing with minting anyway...")
              }
            }
          }
        } else {
          console.log("Sufficient allowance already exists")
        }
      } catch (balanceError: any) {
        console.error("Balance check error:", balanceError)
        if (balanceError.message?.includes('Insufficient Hunos tokens')) {
          throw balanceError
        }
        console.log("Continuing with minting despite balance check error...")
      }

      // Step 3: Mint NFT on blockchain
      const contract = new ethers.Contract(LIQUIDID_ADDRESS, LIQUIDID_ABI, signer)
      // AssetType: 0 = single, 1 = multiple
      const assetType = type === "single" ? 0 : 1
      // Custom price and project token are fixed for now
      const customPrice = BigInt(0);
      const projectToken = "0x0000000000000000000000000000000000000000";
      
      try {
        console.log("Minting LID...")
        const tx = await contract.mintAsset(metadataURI, assetType, customPrice, projectToken)
        await tx.wait()
        console.log("LID minted successfully")
      } catch (mintError: any) {
        console.error("Minting error:", mintError)
        if (mintError.code === 'INSUFFICIENT_FUNDS') {
          throw new Error("Insufficient funds for minting. Please ensure you have enough tokens.")
        } else if (mintError.code === 'UNPREDICTABLE_GAS_LIMIT') {
          throw new Error("Transaction failed. Please check your wallet balance and try again.")
        } else if (mintError.message?.includes('user rejected')) {
          throw new Error("Transaction was rejected by user.")
        } else {
          throw new Error(`Minting failed: ${mintError.message || 'Unknown error'}`)
        }
      }
      
      setSuccess("LID created and minted successfully! Image and metadata uploaded to IPFS.")
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
      setError(err.message || "Failed to create LID")
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
                    alt="LID Preview"
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
              placeholder="Enter your LID name"
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
                {loading ? "Creating..." : "Create LID"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
