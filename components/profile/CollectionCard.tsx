import React from "react";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CollectionCardProps {
  id?: string;
  name: string;
  bannerUrl: string;
  logoUrl: string;
  blockchain?: string;
  verified?: boolean;
  description?: string;
  itemsCount?: number;
  floorPrice?: string;
  status?: 'pending' | 'approved' | 'rejected';
  // Add more props as needed
}

export default function CollectionCard({
  id,
  name,
  bannerUrl,
  logoUrl,
  blockchain,
  verified,
  description,
  itemsCount = 0,
  floorPrice = "-",
  status,
}: CollectionCardProps) {
  // Function to get network icon based on blockchain name
  const getNetworkIcon = (blockchain?: string) => {
    if (!blockchain) return "/images/plume-logo.svg";
    
    const blockchainLower = blockchain.toLowerCase();
    if (blockchainLower.includes("plume")) return "/images/plume-logo.svg";
    if (blockchainLower.includes("ethereum") || blockchainLower.includes("eth")) return "/images/ether-logo.png";
    if (blockchainLower.includes("polygon")) return "/images/polygon-logo.png";
    if (blockchainLower.includes("arbitrum")) return "/images/arbitrum-logo.png";
    if (blockchainLower.includes("solana")) return "/images/solana-logo.png";
    
    return "/images/plume-logo.svg"; // Default to Plume
  };

  const cardContent = (
    <div className="rounded-2xl overflow-hidden bg-[#232423] shadow-lg flex flex-col h-full cursor-pointer hover:shadow-xl transition-shadow">
      {/* Banner image area */}
      <div className="relative w-full aspect-[5/4] bg-[#2c2d2b]">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={name + " banner"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-[#2c2d2b]" />
        )}
        
        {/* Collection icon in hexagon - positioned to overlap banner and info area */}
        <div className="absolute left-1/2 bottom-0 translate-y-1/2 -translate-x-1/2 z-20">
          <svg width="80" height="80" viewBox="0 0 100 100">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#232423" stroke="#222" strokeWidth="2" />
            {logoUrl && (
              <defs>
                <clipPath id={`hexClip-${name.replace(/[^a-zA-Z0-9]/g, '')}`}>
                  <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" />
                </clipPath>
              </defs>
            )}
            {logoUrl ? (
              <image
                href={logoUrl}
                x="10" y="10"
                width="80"
                height="80"
                clipPath={`url(#hexClip-${name.replace(/[^a-zA-Z0-9]/g, '')})`}
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <rect x="10" y="10" width="80" height="80" fill="#444" clipPath={`url(#hexClip-${name.replace(/[^a-zA-Z0-9]/g, '')})`} />
            )}
          </svg>
        </div>
      </div>
      
      {/* Info section */}
      <div className="bg-[#141414] px-4 py-5 flex-1">
        {/* Collection info row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            {/* Collection name with verification check and status */}
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">{name}</span>
              {verified && (
                <Check className="w-4 h-4 text-lime-400" />
              )}
              {status && status !== 'approved' && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  status === 'pending' 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-red-500 text-white'
                }`}>
                  {status === 'pending' ? 'Pending' : 'Rejected'}
                </span>
              )}
            </div>
          </div>
          
          {/* Network icon only - no text */}
          <div className="flex items-center">
            <Image 
              src={getNetworkIcon(blockchain)} 
              alt={blockchain || "Network"} 
              width={16} 
              height={16} 
              className="w-4 h-4"
            />
          </div>
        </div>
        
        {/* Stats row */}
        <div className="flex items-center justify-between pt-2 border-t border-[#353634]">
          <div className="flex items-center space-x-4">
            <div>
              <span className="block text-xs text-gray-400">Floor</span>
              <span className="font-semibold text-white text-sm">{floorPrice}</span>
            </div>
          </div>
          
          {/* Action icons */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-400">{itemsCount}</span>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z"/>
                <path d="M7 7h4v4H7zm6 0h4v4h-4zm-6 6h4v4H7zm6 0h4v4h-4z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // If id is provided, wrap in a link to collection details page
  if (id) {
    return (
      <Link href={`/marketplace/collections/${id}`}>
        {cardContent}
      </Link>
    );
  }

  // Otherwise return just the card content
  return cardContent;
} 