"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
}

export default function NotificationDropdown() {
  const { address, isConnected } = useWallet()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [allNotifications, setAllNotifications] = useState<Notification[]>([])
  const [hasUnread, setHasUnread] = useState(false)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [displayCount, setDisplayCount] = useState(3)

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isConnected || !address) return

    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?userId=${address}&limit=50`)
      const data = await response.json()
      
      if (data.notifications) {
        setAllNotifications(data.notifications)
        const unreadNotifications = data.notifications.filter((n: Notification) => !n.read)
        setHasUnread(unreadNotifications.length > 0)
        
        // Show only the latest 3 unread notifications
        const latestUnread = unreadNotifications.slice(0, displayCount)
        setNotifications(latestUnread)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read and remove from display
  const markAsReadAndRemove = async (notificationId: string) => {
    if (!isConnected || !address) return

    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: address,
          notificationId,
          read: true,
        }),
      })

      if (response.ok) {
        // Remove from display
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        setAllNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
        
        // Check if we still have unread notifications
        const remainingUnread = allNotifications.filter(n => !n.read && n.id !== notificationId)
        setHasUnread(remainingUnread.length > 0)
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Load more notifications
  const loadMoreNotifications = () => {
    const unreadNotifications = allNotifications.filter(n => !n.read)
    const nextBatch = unreadNotifications.slice(0, displayCount + 3)
    setNotifications(nextBatch)
    setDisplayCount(prev => prev + 3)
  }

  // Mark all as read
  const markAllAsRead = async () => {
    if (!isConnected || !address) return

    try {
      const unreadNotifications = allNotifications.filter(n => !n.read)
      await Promise.all(
        unreadNotifications.map(n => 
          fetch("/api/notifications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: address,
              notificationId: n.id,
              read: true,
            }),
          })
        )
      )
      
      setAllNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setNotifications([])
      setHasUnread(false)
      setDisplayCount(3)
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "liked_item_activity":
        return "❤️"
      case "listing_activity":
        return "🏷️"
      case "item_sold":
        return "💰"
      case "bid_activity":
        return "🔨"
      case "outbid":
        return "📈"
      case "auction_expiration":
        return "⏰"
      case "buy_offer_received":
        return "💼"
      case "my_buy_offer_activity":
        return "🤝"
      case "item_transfer":
        return "📦"
      default:
        return "🔔"
    }
  }

  // Fetch notifications on mount and when connected
  useEffect(() => {
    if (isConnected && address) {
      fetchNotifications()
    }
  }, [isConnected, address])

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isConnected || !address) return

    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isConnected, address])

  if (!isConnected) {
    return null
  }

  const hasMoreUnread = allNotifications.filter(n => !n.read).length > displayCount

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-400 hover:text-white"
          onClick={() => setOpen(true)}
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-gray-900 border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="font-semibold text-white">Notifications</h3>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-green-500 hover:text-green-400 hover:bg-gray-800"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-700 last:border-b-0 transition-colors ${
                  !notification.read ? "bg-gray-800/30" : "hover:bg-gray-800/20"
                }`}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="text-lg flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-white text-sm truncate">
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsReadAndRemove(notification.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      {notification.data?.link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-green-500 hover:text-green-400 hover:bg-gray-800"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(notification.data.link, "_blank")
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {(notifications.length > 0 || hasMoreUnread) && (
          <div className="p-3 border-t border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={() => {
                if (notifications.length === 0) {
                  loadMoreNotifications()
                } else {
                  setOpen(false)
                  // Navigate to notifications page or show all notifications
                }
              }}
            >
              {notifications.length === 0 ? "View more notifications" : "View all notifications"}
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 