"use client"

import { Card, CardContent } from "@/components/ui/card"

interface CreateNFTSelectionProps {
  onSelect: (type: "single" | "multiple") => void
}

export default function CreateNFTSelection({ onSelect }: CreateNFTSelectionProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Create NFT</h1>
        <p className="text-gray-400">
          Choose "Single" if you want your collectible to be one of a kind or "Multiple" if you want to sell one
          collectible multiple times
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card
          className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors cursor-pointer"
          onClick={() => onSelect("single")}
        >
          <CardContent className="p-0">
            <div className="aspect-square flex items-center justify-center">
              <div className="w-24 h-24">
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full text-white"
                >
                  <rect x="10" y="20" width="80" height="60" rx="5" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M10 40 H90 M30 40 V80 M70 40 V80"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl text-white font-semibold">Single</h3>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors cursor-pointer"
          onClick={() => onSelect("multiple")}
        >
          <CardContent className="p-0">
            <div className="aspect-square flex items-center justify-center">
              <div className="w-24 h-24 relative">
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full text-white absolute -top-2 -left-2"
                >
                  <rect x="10" y="20" width="80" height="60" rx="5" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M10 40 H90 M30 40 V80 M70 40 V80"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full text-white absolute top-2 left-2"
                >
                  <rect x="10" y="20" width="80" height="60" rx="5" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M10 40 H90 M30 40 V80 M70 40 V80"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl text-white font-semibold">Multiple</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="py-16">
        <h2 className="text-2xl font-bold text-center mb-6">Get the latest Blocvault updates</h2>
        <div className="flex max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your Email"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-l-md px-4 py-2 text-white"
          />
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-r-md">→</button>
        </div>
      </div>
    </div>
  )
}
