"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Heart, Tag, ShoppingCart, Gavel, TrendingUp, Clock, DollarSign, Users, Send, Bell } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"

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
  const { address, isConnected } = useWallet()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
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

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      if (!isConnected || !address) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/settings?userId=${address}`)
        const data = await response.json()
        
        if (data.settings) {
          setSettings({
            currency: data.settings.currency || "usd",
            telegram: data.settings.telegram !== undefined ? data.settings.telegram : true,
            eventTypes: {
              likedItemActivity: data.settings.eventTypes?.likedItemActivity !== undefined ? data.settings.eventTypes.likedItemActivity : true,
              listingActivity: data.settings.eventTypes?.listingActivity !== undefined ? data.settings.eventTypes.listingActivity : true,
              itemSold: data.settings.eventTypes?.itemSold !== undefined ? data.settings.eventTypes.itemSold : true,
              bidActivity: data.settings.eventTypes?.bidActivity !== undefined ? data.settings.eventTypes.bidActivity : true,
              outbid: data.settings.eventTypes?.outbid !== undefined ? data.settings.eventTypes.outbid : true,
              auctionExpiration: data.settings.eventTypes?.auctionExpiration !== undefined ? data.settings.eventTypes.auctionExpiration : true,
              buyOfferReceived: data.settings.eventTypes?.buyOfferReceived !== undefined ? data.settings.eventTypes.buyOfferReceived : true,
              myBuyOfferActivity: data.settings.eventTypes?.myBuyOfferActivity !== undefined ? data.settings.eventTypes.myBuyOfferActivity : true,
              itemTransfer: data.settings.eventTypes?.itemTransfer !== undefined ? data.settings.eventTypes.itemTransfer : true,
            },
          })
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [isConnected, address, toast])

  // Save settings to database
  const saveSettings = async (newSettings: NotificationSettings) => {
    if (!isConnected || !address) {
      toast({
        title: "Error",
        description: "Please connect your wallet to save settings",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: address,
          settings: newSettings,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
      } else {
        throw new Error(data.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCurrencyChange = async (value: string) => {
    const newSettings = {
      ...settings,
      currency: value,
    }
    setSettings(newSettings)
    await saveSettings(newSettings)
  }

  const handleTelegramToggle = async (checked: boolean) => {
    const newSettings = {
      ...settings,
      telegram: checked,
    }
    setSettings(newSettings)
    await saveSettings(newSettings)
  }

  const handleEventTypeToggle = async (eventType: keyof NotificationSettings["eventTypes"], checked: boolean) => {
    const newSettings = {
      ...settings,
      eventTypes: {
        ...settings.eventTypes,
        [eventType]: checked,
      },
    }
    setSettings(newSettings)
    await saveSettings(newSettings)
  }

  // Demo notification function
  const sendDemoNotification = async (type: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Error",
        description: "Please connect your wallet to test notifications",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/notifications/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: address,
          type,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Demo notification sent! Check the bell icon in the header.`,
        })
      } else {
        throw new Error(data.error || "Failed to send demo notification")
      }
    } catch (error) {
      console.error("Error sending demo notification:", error)
      toast({
        title: "Error",
        description: "Failed to send demo notification",
        variant: "destructive",
      })
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400">Please connect your wallet to access and save your settings.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading settings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        {saving && (
          <div className="flex items-center space-x-2 text-green-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
            <span className="text-sm">Saving...</span>
          </div>
        )}
      </div>

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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-white font-semibold mb-2">Event Types</h2>
                <p className="text-gray-400 text-sm">
                  Turn on/off events to receive through the selected notification methods.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendDemoNotification("item_sold")}
                className="text-xs border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
              >
                <Bell className="w-3 h-3 mr-1" />
                Test Notification
              </Button>
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
