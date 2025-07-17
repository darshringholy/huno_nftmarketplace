import React from "react";
import Link from "next/link";

interface CollectionCardProps {
  id: string;
  name: string;
  bannerUrl: string;
  logoUrl: string;
  blockchain?: string;
  verified?: boolean;
  description?: string;
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
}: CollectionCardProps) {
  return (
    <Link href={`/marketplace/collections/${id}`} className="block group focus:outline-none">
      <div className="relative rounded-xl overflow-hidden bg-[#191A19] shadow-lg transition-transform group-hover:scale-[1.03] group-hover:shadow-2xl cursor-pointer" style={{ width: 320, minHeight: 440, display: 'flex', flexDirection: 'column' }}>
        {/* Banner image as top section, responsive aspect ratio */}
        <div className="w-full aspect-[16/9] bg-gray-800 relative">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={name + " banner"}
              className="w-full h-full object-cover absolute inset-0"
              style={{ display: 'block' }}
            />
          ) : (
            <div className="w-full h-full bg-gray-700 absolute inset-0" />
          )}
          {/* Hexagon logo - SVG, overlaps banner and info area */}
          <div className="absolute left-1/2 bottom-0 translate-y-1/2 -translate-x-1/2 z-20" style={{ pointerEvents: 'none' }}>
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ display: 'block' }}>
              <polygon
                points="40,5 74,22.5 74,57.5 40,75 6,57.5 6,22.5"
                fill="#444"
                stroke="#222"
                strokeWidth="3"
              />
              {logoUrl && (
                <defs>
                  <clipPath id="hexClip">
                    <polygon points="40,5 74,22.5 74,57.5 40,75 6,57.5 6,22.5" />
                  </clipPath>
                </defs>
              )}
              {logoUrl ? (
                <image
                  href={logoUrl}
                  x="6" y="7"
                  width="68"
                  height="66"
                  clipPath="url(#hexClip)"
                  preserveAspectRatio="xMidYMid slice"
                />
              ) : null}
            </svg>
          </div>
        </div>
        {/* Info area - shorter than banner, full width, left-aligned */}
        <div className="flex-1 w-full bg-[#101010] px-6 pt-14 pb-6 flex flex-col gap-2 items-start justify-center" style={{ minHeight: 90 }}>
          <div className="flex items-center gap-2 mb-2">
            {blockchain && <span className="text-lg text-gray-400 font-medium">{blockchain}</span>}
            {verified && <span className="ml-1 w-6 h-6 rounded-full bg-lime-400 flex items-center justify-center text-black text-lg">✔</span>}
          </div>
          <div className="font-bold text-xl text-white leading-tight mb-1 truncate">{name}</div>
          {description && <div className="text-base text-gray-400 line-clamp-2">{description}</div>}
        </div>
      </div>
    </Link>
  );
} 