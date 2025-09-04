"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  Settings, 
  Users, 
  BarChart3, 
  Shield, 
  Database,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import AdminProtected from "@/components/auth/AdminProtected"

export default function AdminDashboard() {
  return (
    <AdminProtected>
      <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Manage marketplace operations and monitor system health</p>
        </div>
        <Badge className="bg-lime-400 text-black">
          <Shield className="w-3 h-3 mr-1" />
          Authorized Creator
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Listings</p>
                <p className="text-2xl font-bold text-white">1,247</p>
              </div>
              <Activity className="w-8 h-8 text-lime-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold text-white">892</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-white">3,456</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Event Listener</p>
                <p className="text-2xl font-bold text-white">Running</p>
              </div>
              <Database className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800 hover:border-lime-400 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-lime-400" />
              Event Listener
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm mb-4">
              Monitor and control the marketplace event listener that processes smart contract events.
            </p>
            <Link href="/admin/events">
              <Button className="w-full bg-lime-400 hover:bg-lime-500 text-black">
                Manage Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:border-lime-400 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Collection Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm mb-4">
              Approve, reject, and verify collections before they go live on the marketplace.
            </p>
            <Link href="/admin/collections">
              <Button className="w-full bg-lime-400 hover:bg-lime-500 text-black">
                Manage Collections
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:border-lime-400 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm mb-4">
              View marketplace analytics, sales reports, and performance metrics.
            </p>
            <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white" disabled>
              Coming Soon
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:border-lime-400 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm mb-4">
              Configure system parameters, update settings, and manage configurations.
            </p>
            <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white" disabled>
              Coming Soon
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:border-lime-400 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-400" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm mb-4">
              Monitor database health, view logs, and manage data operations.
            </p>
            <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white" disabled>
              Coming Soon
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 hover:border-lime-400 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm mb-4">
              Monitor security events, manage access controls, and view audit logs.
            </p>
            <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white" disabled>
              Coming Soon
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div>
                  <p className="text-white text-sm">Event listener started</p>
                  <p className="text-gray-400 text-xs">2 minutes ago</p>
                </div>
              </div>
              <Badge className="bg-green-500 text-black text-xs">System</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <p className="text-white text-sm">New sale completed</p>
                  <p className="text-gray-400 text-xs">5 minutes ago</p>
                </div>
              </div>
              <Badge className="bg-blue-500 text-white text-xs">Sale</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div>
                  <p className="text-white text-sm">New user registered</p>
                  <p className="text-gray-400 text-xs">12 minutes ago</p>
                </div>
              </div>
              <Badge className="bg-purple-500 text-white text-xs">User</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminProtected>
  )
} 