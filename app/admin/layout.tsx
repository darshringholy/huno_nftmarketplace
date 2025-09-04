import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  Users, 
  ArrowLeft,
  Home
} from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Panel - Hunos LID Marketplace",
  description: "Admin panel for managing marketplace events and system operations",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Admin Navigation Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/admin">
              <Button variant="ghost" className="text-white hover:bg-gray-800">
                <Home className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2">
              <Link href="/admin/collections">
                <Button variant="ghost" className="text-white hover:bg-gray-800">
                  <Users className="w-4 h-4 mr-2" />
                  Collections
                </Button>
              </Link>
              
              <Link href="/admin/events">
                <Button variant="ghost" className="text-white hover:bg-gray-800">
                  <Activity className="w-4 h-4 mr-2" />
                  Events
                </Button>
              </Link>
            </div>
          </div>
          
          <Link href="/">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="px-6 py-8">
        {children}
      </div>
    </div>
  )
} 