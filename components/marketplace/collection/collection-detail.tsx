"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Check } from "lucide-react"

export default function CollectionDetail() {
  const { id } = useParams();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Info");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/collections?id=${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Collection not found");
        const { collection } = await res.json();
        setCollection(collection);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-12 text-center text-gray-400">Loading collection...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!collection) return <div className="py-12 text-center text-gray-400">Collection not found.</div>;

  return (
    <div className="flex justify-between items-start py-12">
      {/* Left: Image Placeholder */}
      <div className="mr-12 flex flex-col items-center">
        {/* Banner Image */}
        <div className="w-[420px] h-[240px] bg-[#232424] rounded-xl flex items-center justify-center mb-8 overflow-hidden">
          {collection.bannerUrl ? (
            <img src={collection.bannerUrl} alt={collection.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#232424] rounded-xl" />
          )}
        </div>
        {/* Logo Hexagon */}
        <div className="-mt-16 mb-8">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <polygon
              points="40,5 74,22.5 74,57.5 40,75 6,57.5 6,22.5"
              fill="#444"
              stroke="#222"
              strokeWidth="3"
            />
            {collection.logoUrl && (
              <defs>
                <clipPath id="hexClipDetail">
                  <polygon points="40,5 74,22.5 74,57.5 40,75 6,57.5 6,22.5" />
                </clipPath>
              </defs>
            )}
            {collection.logoUrl ? (
              <image
                href={collection.logoUrl}
                x="6" y="7"
                width="68"
                height="66"
                clipPath="url(#hexClipDetail)"
                preserveAspectRatio="xMidYMid slice"
              />
            ) : null}
          </svg>
        </div>
        {/* Price Card (placeholder) */}
        <div className="w-[420px] bg-[#181818] rounded-xl p-6 flex flex-col space-y-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-gray-400 mb-1">Price</div>
              <div className="text-2xl font-bold text-white leading-tight">-</div>
              <div className="text-sm text-gray-500 mt-1">-</div>
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
            <h1 className="text-3xl font-bold text-white mb-1">{collection.name}</h1>
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
              {/* Owner (placeholder) */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#232424] rounded-full flex items-center justify-center">
                  {/* Placeholder for owner icon */}
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Owner</span>
                  <span className="text-white font-semibold">-</span>
                </div>
              </div>
              {/* Total (placeholder) */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#232424] rounded-full flex items-center justify-center">
                  {/* Placeholder for total icon */}
                  <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="text-gray-500">
                    <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="7" y="8" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">-</span>
              </div>
            </div>
          </div>
        </div>
        {/* Description */}
        <p className="text-gray-400 text-sm mb-4">
          {collection.description}
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
        {/* Tab content placeholder */}
        <div className="bg-[#181818] rounded-lg p-6 text-white space-y-4">
          <div className="text-gray-400">Tab content coming soon...</div>
        </div>
      </div>
    </div>
  );
}
