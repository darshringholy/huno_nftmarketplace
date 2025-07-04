"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Filter, ExternalLink } from "lucide-react"
import ActivitiesFilterModal from "./activities-filter-modal"

interface Activity {
  id: string
  type: string
  subType: string // e.g., "Bidded", "As auction"
  item: {
    name: string
    image: string
    collection: string
    verified?: boolean
  }
  from: { name: string; avatar: string }
  to: { name: string; avatar: string }
  price: string
  usdPrice: string
  currency: string
  time: string
  link: string
}

const activities: Activity[] = [
  {
    id: "1",
    type: "sale",
    subType: "Direct Sale",
    item: {
      name: "Neo Urugami #1234",
      image: "/placeholder.svg?height=60&width=60",
      collection: "Genesis Collection",
    },
    from: { name: "0x1234...5678", avatar: "/placeholder.svg?height=32&width=32" },
    to: { name: "0x8765...4321", avatar: "/placeholder.svg?height=32&width=32" },
    price: "2.5",
    usdPrice: "5,000",
    currency: "PUSD",
    time: "2 minutes ago",
    link: "#",
  },
  {
    id: "2",
    type: "auction",
    subType: "As auction",
    item: {
      name: "Purple Flower #567",
      image: "/placeholder.svg?height=60&width=60",
      collection: "Nature Collection",
    },
    from: { name: "0x9876...1234", avatar: "/placeholder.svg?height=32&width=32" },
    to: { name: "0x4321...8765", avatar: "/placeholder.svg?height=32&width=32" },
    price: "1.8",
    usdPrice: "3,600",
    currency: "PUSD",
    time: "5 minutes ago",
    link: "#",
  },
  {
    id: "3",
    type: "offer",
    subType: "Offer Made",
    item: {
      name: "Crypto Fight #890",
      image: "/placeholder.svg?height=60&width=60",
      collection: "Gaming Collection",
    },
    from: { name: "0x5555...9999", avatar: "/placeholder.svg?height=32&width=32" },
    to: { name: "0x7777...3333", avatar: "/placeholder.svg?height=32&width=32" },
    price: "0.75",
    usdPrice: "1,500",
    currency: "PUSD",
    time: "10 minutes ago",
    link: "#",
  },
  {
    id: "4",
    type: "sale",
    subType: "Direct Sale",
    item: {
      name: "Magic Beasties #123",
      image: "/placeholder.svg?height=60&width=60",
      collection: "Fantasy Collection",
    },
    from: { name: "0x1111...2222", avatar: "/placeholder.svg?height=32&width=32" },
    to: { name: "0x3333...4444", avatar: "/placeholder.svg?height=32&width=32" },
    price: "3.2",
    usdPrice: "6,400",
    currency: "PUSD",
    time: "15 minutes ago",
    link: "#",
  },
]

interface ActivitiesTableProps {
  activityFilter: string
  liquidId?: string
}

export default function ActivitiesTable({ activityFilter, liquidId }: ActivitiesTableProps) {
  const [filterModalOpen, setFilterModalOpen] = useState(false)

  const filteredActivities = activities.filter((activity) => {
    let matchesType = true
    if (activityFilter === "fixed-price") matchesType = activity.type === "sale"
    else if (activityFilter === "auction") matchesType = activity.type === "auction"
    else if (activityFilter === "with-buy-offer") matchesType = activity.type === "offer"
    let matchesId = true
    if (liquidId) {
      matchesId = activity.item.name.includes(liquidId) || activity.item.collection.includes(liquidId)
    }
    return (activityFilter === "all" || matchesType) && matchesId
  })

  // Pagination state
  const [page, setPage] = useState(1)
  const pageSize = 10
  const paginatedActivities = filteredActivities.slice((page - 1) * pageSize, page * pageSize)


  return (
    <div className="space-y-4">
      {/* Filter Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="border-gray-700" onClick={() => setFilterModalOpen(true)}>
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
        <div className="col-span-2">Type</div>
        <div className="col-span-3">Items</div>
        <div className="col-span-2">Price</div>
        <div className="col-span-1">From</div>
        <div className="col-span-1">To</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-1"></div>
      </div>

      {/* Activities List */}
      <div className="space-y-2">
        {paginatedActivities.map((activity) => (
          <Card key={activity.id} className="bg-transparent border-none hover:bg-gray-700 transition-colors">
            <CardContent className="p-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Type */}
                <div className="col-span-2">
                  <span className="text-white text-lg capitalize">{activity.type}</span>
                  <div className="text-xs text-gray-500">{activity.subType}</div>
                </div>
                {/* Item */}
                <div className="col-span-3 flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center text-gray-500">
                      {activity.item.name}
                      {activity.item.verified && (
                        <span className="ml-1 text-green-400">✔️</span>
                      )}
                    </h4>
                    <p className="text-xs text-white">{activity.item.collection}</p>
                  </div>
                </div>
                {/* Price */}
                <div className="col-span-2">
                  <span className="font-semibold text-white">{activity.price} {activity.currency}</span>
                  <div className="text-xs text-gray-400">${activity.usdPrice}</div>
                </div>
                {/* From */}
                <div className="col-span-1 text-sm text-gray-300">{activity.from.name}</div>
                {/* To */}
                <div className="col-span-1 text-sm text-gray-300">{activity.to.name || "-"}</div>
                {/* Date */}
                <div className="col-span-2 text-sm text-gray-400">{activity.time}</div>
                {/* External Link */}
                <div className="col-span-1 flex justify-end">
                  <a href={activity.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button onClick={() => setPage(page - 1)} disabled={page === 1}>{"<"}</Button>
        {[...Array(5)].map((_, i) => (
          <Button
            key={i}
            variant={page === i + 1 ? "default" : "outline"}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
        <span>...</span>
        <Button onClick={() => setPage(page + 1)}>{">"}</Button>
      </div>
      {filteredActivities.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400">No activities found for the selected filter.</p>
        </div>
      )}

      {/* Activities Filter Modal */}
      <ActivitiesFilterModal open={filterModalOpen} onOpenChange={setFilterModalOpen} />
    </div>
  )
}
