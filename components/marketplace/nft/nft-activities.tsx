import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NFTActivitiesProps {
  nftId: string
}

const activities = [
  {
    type: "Buy & Offer",
    collection: "Breathing Space",
    price: "0.65 BUSD",
    from: "Gragha_m02",
    to: "Gragha_m02",
    time: "5 minutes ago",
  },
  {
    type: "Buy & Offer",
    collection: "Breathing Space",
    price: "0.65 BUSD",
    from: "Gragha_m02",
    to: "Gragha_m02",
    time: "1 hour ago",
  },
  {
    type: "Buy & Offer",
    collection: "Breathing Space",
    price: "0.65 BUSD",
    from: "Gragha_m02",
    to: "Gragha_m02",
    time: "3 hours ago",
  },
  {
    type: "Buy & Offer",
    collection: "Breathing Space",
    price: "0.65 BUSD",
    from: "Gragha_m02",
    to: "Gragha_m02",
    time: "7 hours ago",
  },
  {
    type: "Listing",
    collection: "Breathing Space",
    price: "0.65 BUSD",
    from: "Gragha_m02",
    to: "Gragha_m02",
    time: "6 days ago",
  },
]

export default function NFTActivities({ nftId }: NFTActivitiesProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-6">Activities</h2>

        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
          <div>Event</div>
          <div>Item</div>
          <div>Price</div>
          <div>From</div>
          <div>To</div>
          <div>Date</div>
        </div>

        {/* Activities List */}
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="grid grid-cols-6 gap-4 items-center py-3 px-4 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <div>
                <Badge className="bg-green-500 text-black text-xs">{activity.type}</Badge>
              </div>
              <div className="text-sm">{activity.collection}</div>
              <div className="text-sm font-semibold">{activity.price}</div>
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-green-500 text-black text-xs">
                    {activity.from.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-300">{activity.from}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-green-500 text-black text-xs">
                    {activity.to.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-300">{activity.to}</span>
              </div>
              <div className="text-sm text-gray-400">{activity.time}</div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-2">
          <button className="w-8 h-8 bg-green-500 text-black rounded flex items-center justify-center text-sm font-semibold">
            1
          </button>
          <button className="w-8 h-8 bg-gray-800 text-gray-400 rounded flex items-center justify-center text-sm">
            2
          </button>
          <button className="w-8 h-8 bg-gray-800 text-gray-400 rounded flex items-center justify-center text-sm">
            3
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
