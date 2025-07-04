"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Heart, Tag, ShoppingCart, Gavel, TrendingUp, Clock, DollarSign, Users, Send } from "lucide-react"

interface NotificationSettings {
  currency: string
  telegram: boolean
  eventTypes: {
    likedItemActivity: boolean
    listingActivity: boolean
    itemSold: boolean
    bidActivity: boolean
    outbid: boolean
    auctionExpiration: boolean
    buyOfferReceived: boolean
    myBuyOfferActivity: boolean
    itemTransfer: boolean
  }
}

const eventTypeOptions = [
  {
    key: "likedItemActivity",
    icon: Heart,
    title: "Liked Item activity",
    description: "When any activities occurred on items you like",
  },
  {
    key: "listingActivity",
    icon: Tag,
    title: "Listing activity",
    description: "When your listing item is fixed price or auction",
  },
  {
    key: "itemSold",
    icon: ShoppingCart,
    title: "Item Sold",
    description: "When someone purchases one of your items",
  },
  {
    key: "bidActivity",
    icon: Gavel,
    title: "Bid activity",
    description: "When the auction you started receives bids",
  },
  {
    key: "outbid",
    icon: TrendingUp,
    title: "Outbid",
    description: "When an offer you placed is exceeded by another user",
  },
  {
    key: "auctionExpiration",
    icon: Clock,
    title: "Auction expiration",
    description: "When the listing you started ends without bids",
  },
  {
    key: "buyOfferReceived",
    icon: DollarSign,
    title: "Buy offer received",
    description: "When someone makes a buy offer to one of your items",
  },
  {
    key: "myBuyOfferActivity",
    icon: Users,
    title: "My buy offer activity",
    description: "When your buy offer gets accepted or rejected",
  },
  {
    key: "itemTransfer",
    icon: Send,
    title: "Item transfer",
    description: "When you send/receive an item",
  },
]

export default function SettingsForm() {
  const [settings, setSettings] = useState<NotificationSettings>({
    currency: "usd",
    telegram: true,
    eventTypes: {
      likedItemActivity: true,
      listingActivity: true,
      itemSold: true,
      bidActivity: true,
      outbid: true,
      auctionExpiration: true,
      buyOfferReceived: true,
      myBuyOfferActivity: true,
      itemTransfer: true,
    },
  })

  const handleCurrencyChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      currency: value,
    }))
  }

  const handleTelegramToggle = (checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      telegram: checked,
    }))
  }

  const handleEventTypeToggle = (eventType: keyof NotificationSettings["eventTypes"], checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      eventTypes: {
        ...prev.eventTypes,
        [eventType]: checked,
      },
    }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 space-y-8">
          {/* Currency Selection */}
          <div className="space-y-4">
            <Select value={settings.currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">JPY (¥)</SelectItem>
                <SelectItem value="btc">EUR (€)</SelectItem>
                <SelectItem value="eth">HKD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification Methods */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl text-white font-semibold mb-2">Notification Methods</h2>
              <p className="text-gray-400 text-sm">How you would like to receive the notifications</p>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Telegram</h3>
                  <p className="text-sm text-gray-400">{settings.telegram ? "Connected" : "Not Connected"}</p>
                </div>
              </div>
              <Switch
                checked={settings.telegram}
                onCheckedChange={handleTelegramToggle}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>

          {/* Event Types */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl text-white font-semibold mb-2">Event Types</h2>
              <p className="text-gray-400 text-sm">
                Turn on/off events to receive through the selected notification methods.
              </p>
            </div>

            <div className="space-y-4">
              {eventTypeOptions.map((option) => {
                const IconComponent = option.icon
                const isEnabled = settings.eventTypes[option.key as keyof NotificationSettings["eventTypes"]]

                return (
                  <div key={option.key} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{option.title}</h3>
                        <p className="text-sm text-gray-400">{option.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        handleEventTypeToggle(option.key as keyof NotificationSettings["eventTypes"], checked)
                      }
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
