import React from "react";

interface CollectionCardProps {
  name: string;
  bannerUrl: string;
  logoUrl: string;
  blockchain?: string;
  verified?: boolean;
  description?: string;
  // Add more props as needed
}

export default function CollectionCard({
  name,
  bannerUrl,
  logoUrl,
  blockchain,
  verified,
  description,
}: CollectionCardProps) {
  return (
    <div className="rounded-3xl overflow-hidden bg-gray-900 shadow-lg flex flex-col">
      {/* Banner image as background */}
      <div className="relative w-full aspect-[4/3] bg-gray-800">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={name + " banner"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-700" />
        )}
        {/* Hexagon logo overlay */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-20 h-20 flex items-center justify-center" style={{ clipPath: "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)" }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name + " logo"}
                className="w-full h-full object-contain bg-white"
              />
            ) : (
              <div className="w-full h-full bg-gray-500" />
            )}
          </div>
        </div>
      </div>
      {/* Info section */}
      <div className="bg-black px-6 py-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {blockchain && <span className="text-xs text-gray-400">{blockchain}</span>}
          {verified && <span className="ml-1 w-5 h-5 rounded-full bg-green-400 flex items-center justify-center text-black text-xs">✔</span>}
        </div>
        <div className="font-bold text-lg text-white truncate">{name}</div>
        {description && <div className="text-xs text-gray-400 line-clamp-2">{description}</div>}
      </div>
    </div>
  );
} 