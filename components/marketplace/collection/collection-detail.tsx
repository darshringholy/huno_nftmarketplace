"use client"

import { useState } from "react"
import { Check } from "lucide-react"

// Mockup data for all tabs
const mockAttributes = [
  { label: "Staking score", value: "255" },
  { label: "Type", value: "Rocket", percent: "11.7%" },
  { label: "Color", value: "Special Edition Car", percent: "11.7%" },
  { label: "Background", value: "Red", percent: "11.7%" },
  { label: "Opening network", value: "Plume", percent: "11.7%" },
  { label: "Special", value: "Yes", percent: "11.7%" },
];

const mockOffers = [
  {
    user: "Cimmy",
    value: "0.83",
    currency: "PUSD",
    usd: "$ 366.86",
    status: "Lead",
    statusColor: "text-green-400",
    time: "5 minutes ago",
  },
  {
    user: "TheElerKing",
    value: "0.935",
    currency: "PUSD",
    usd: "$ 349.18",
    status: "Outbid",
    statusColor: "text-red-500",
    time: "1 hours ago",
  },
  {
    user: "0xgj32...e121",
    value: "0.85",
    currency: "PUSD",
    usd: "$ 331.52",
    status: "Outbid",
    statusColor: "text-red-500",
    time: "4 hours ago",
  },
  {
    user: "TheElerKing",
    value: "0.77",
    currency: "PUSD",
    usd: "$ 318.24",
    status: "Outbid",
    statusColor: "text-red-500",
    time: "5 hours ago",
  },
];

const mockBids = [
  {
    user: "Cimmy",
    value: "0.83",
    currency: "PUSD",
    usd: "$ 366.86",
    status: "Lead",
    statusColor: "text-green-400",
    time: "5 minutes ago",
  },
  {
    user: "TheElerKing",
    value: "0.935",
    currency: "PUSD",
    usd: "$ 349.18",
    status: "Outbid",
    statusColor: "text-red-500",
    time: "1 hours ago",
  },
  {
    user: "0xgj32...e121",
    value: "0.85",
    currency: "PUSD",
    usd: "$ 331.52",
    status: "Outbid",
    statusColor: "text-red-500",
    time: "4 hours ago",
  },
  {
    user: "TheElerKing",
    value: "0.77",
    currency: "PUSD",
    usd: "$ 318.24",
    status: "Outbid",
    statusColor: "text-red-500",
    time: "5 hours ago",
  },
];

const mockInfo = [
  { label: "Contract", value: "0x85F0...9E2D ↗", isLink: true },
  { label: "Token ID", value: "1000287613 ↗", isLink: true },
  { label: "Token Standard", value: "ERC-1155" },
  { label: "Blockchain", value: "Plume" },
  { label: "Metadata", value: "Centralized ↗", isLink: true },
];

const collections = [
  {
    id: "doodle-apes",
    name: "Doodle Apes",
    description:
      "Doodle Apes are beautifully animated digital collectibles with varying identities. Each Doodle Ape is unique and has a truly unique set of traits and characteristics that DOODLE holders.",
    verified: true,
    bannerImage: "/placeholder.svg?height=200&width=400",
    avatarImage: "/placeholder.svg?height=80&width=80",
    stats: {
      items: "65,307",
      owners: "11,923",
      volume: "26,328",
      floorPrice: "5.06K",
    },
    sampleItems: [
      { name: "Car-free City", price: "0.75 BUSD" },
      { name: "White car", price: "0.75 BUSD" },
      { name: "Green car", price: "0.75 BUSD" },
      { name: "Gold car", price: "0.75 BUSD" },
    ],
  },
  // Add more collections here...
]

export default function CollectionDetail() {
  const [activeTab, setActiveTab] = useState("Info");

  // For demonstration, use the first collection
  const collection = collections[0];

  return (
    <div className="flex justify-between items-start py-12">
      {/* Left: Image Placeholder */}
      <div className="mr-12 flex flex-col items-center">
        {/* Image Placeholder */}
        <div className="w-[420px] h-[420px] bg-[#232424] rounded-xl flex items-center justify-center mb-8">
          {/* Replace with actual image if available */}
          <div className="w-full h-full bg-[#232424] rounded-xl" />
        </div>
        {/* Price Card */}
        <div className="w-[480px] bg-[#181818] rounded-xl p-6 flex flex-col space-y-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-gray-400 mb-1">Price</div>
              <div className="text-2xl font-bold text-white leading-tight">0.75 PUSD</div>
              <div className="text-sm text-gray-500 mt-1">$327.54</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex flex-row items-center space-x-2">
                <button className="text-[#C6FF4A] font-semibold text-sm focus:outline-none hover:underline">
                  Make Offer
                </button>
                <span className="text-xs text-gray-500 mt-1">to buy at another price</span>
              </div>
            </div>
          </div>
          <button className="w-full bg-[#C6FF4A] hover:bg-[#b0e63e] text-black font-semibold py-3 rounded-lg text-lg transition-colors duration-150">
            Buy Now
          </button>
        </div>
      </div>

      {/* Right: Details */}
      <div className="flex-1 max-w-2xl">
        {/* Collection Name and Owner */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Giraffe #110</h1>
            <div className="flex items-center space-x-12">
              {/* Collection */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#232424] rounded-full flex items-center justify-center">
                  {/* Placeholder for collection icon */}
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Collection</span>
                  <span className="flex items-center">
                    <span className="text-white font-semibold">{collection.name}</span>
                    {collection.verified && (
                      <span className="ml-1 text-green-400 align-middle">
                        <Check className="inline w-4 h-4" />
                      </span>
                    )}
                  </span>
                </div>
              </div>
              {/* Owner */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#232424] rounded-full flex items-center justify-center">
                  {/* Placeholder for owner icon */}
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Owner</span>
                  <span className="text-white font-semibold">0xhg34...nGj2</span>
                </div>
              </div>
              {/* Total */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#232424] rounded-full flex items-center justify-center">
                  {/* Placeholder for total icon */}
                  <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="text-gray-500">
                    <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="7" y="8" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">1000 Total</span>
              </div>
            </div>
          </div>
        </div>
        {/* Description */}
        <p className="text-gray-400 text-sm mb-4">
          Breathing Space joyfully brings the unique blend of DeFi, Collect-to-Earn and Play-to-Earn Abstract is known for to the Neo N3 ecosystem...
        </p>

        {/* Tabs */}
        <div className="flex space-x-4 mb-4">
          {["Attributes", "Offers", "Bids", "Info"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded ${activeTab === tab ? "bg-white text-black" : "bg-[#181818] text-white"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Attributes Tab */}
        {activeTab === "Attributes" && (
          <div className="bg-[#181818] rounded-lg p-6 text-white space-y-4">
            {mockAttributes.map((attr) => (
              <div className="flex justify-between items-center" key={attr.label}>
                <span className="text-gray-400">{attr.label}</span>
                <span>
                  <span className="text-white">{attr.value}</span>
                  {attr.percent && (
                    <span className="ml-2 text-xs text-gray-400">({attr.percent})</span>
                  )}
                </span>
              </div>
            ))}
            <div className="mt-4 text-xs text-gray-400">
              You can <span className="text-green-400 font-bold cursor-pointer">Report any problem</span> you find.
            </div>
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === "Offers" && (
          <div className="bg-[#181818] rounded-lg p-6 text-white space-y-4">
            <div className="space-y-6">
              {mockOffers.map((offer, idx) => (
                <div className="flex items-center justify-between" key={idx}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#232423]" />
                    <div>
                      <div className="text-sm font-semibold">{offer.user}</div>
                      <div className="text-base font-bold">
                        {offer.value} <span className="text-gray-400 font-normal">{offer.currency}</span>{" "}
                        <span className="text-xs text-gray-400">({offer.usd})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`${offer.statusColor} font-semibold`}>
                      {offer.status} <span className="inline-block align-middle">↗</span>
                    </span>
                    <span className="text-xs text-gray-400 mt-1">{offer.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bids Tab */}
        {activeTab === "Bids" && (
          <div className="bg-[#181818] rounded-lg p-6 text-white space-y-4">
            <div className="space-y-6">
              {mockBids.map((bid, idx) => (
                <div className="flex items-center justify-between" key={idx}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#232423]" />
                    <div>
                      <div className="text-sm font-semibold">{bid.user}</div>
                      <div className="text-base font-bold">
                        {bid.value} <span className="text-gray-400 font-normal">{bid.currency}</span>{" "}
                        <span className="text-xs text-gray-400">({bid.usd})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`${bid.statusColor} font-semibold`}>
                      {bid.status} <span className="inline-block align-middle">↗</span>
                    </span>
                    <span className="text-xs text-gray-400 mt-1">{bid.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Tab */}
        {activeTab === "Info" && (
          <div className="bg-[#181818] rounded-lg p-6 text-white space-y-4">
            {mockInfo.map((info) => (
              <div className="flex justify-between" key={info.label}>
                <span className="text-gray-400">{info.label}</span>
                {info.isLink ? (
                  <span className="text-green-400 cursor-pointer">{info.value}</span>
                ) : (
                  <span>{info.value}</span>
                )}
              </div>
            ))}
            <div className="mt-4 text-xs text-gray-400">
              You can <span className="text-green-400 font-bold cursor-pointer">Report any problem</span> you find.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
