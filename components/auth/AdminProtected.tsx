"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { checkUserAuthorization, AuthResult } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Shield, Wallet } from "lucide-react"
import WalletConnectDialog from "@/components/ui/wallet-connect-dialog"

interface AdminProtectedProps {
  children: React.ReactNode
}

export default function AdminProtected({ children }: AdminProtectedProps) {
  const router = useRouter()
  const [authResult, setAuthResult] = useState<AuthResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)

  const checkAuth = async () => {
    setLoading(true)
    try {
      const result = await checkUserAuthorization()
      setAuthResult(result)
    } catch (error) {
      console.error("Auth check error:", error)
      setAuthResult({
        isAuthorized: false,
        isConnected: false,
        error: "Failed to check authorization"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const handleWalletSelect = () => {
    setWalletDialogOpen(false)
    // Recheck auth after wallet connection
    setTimeout(checkAuth, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authorization...</p>
        </div>
      </div>
    )
  }

  if (!authResult?.isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-black" />
            </div>
            <CardTitle className="text-white">Wallet Connection Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-center">
              You need to connect your wallet to access admin features.
            </p>
            <Button 
              onClick={() => setWalletDialogOpen(true)}
              className="w-full bg-lime-400 hover:bg-lime-500 text-black"
            >
              Connect Wallet
            </Button>
          </CardContent>
        </Card>

        <WalletConnectDialog
          open={walletDialogOpen}
          onOpenChange={setWalletDialogOpen}
          onWalletSelect={handleWalletSelect}
        />
      </div>
    )
  }

  if (!authResult?.isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-gray-400">
                You are not authorized to access admin features.
              </p>
              <p className="text-sm text-gray-500">
                Only authorized creators can access this page.
              </p>
              {authResult.address && (
                <p className="text-xs text-gray-600 font-mono">
                  Connected: {authResult.address.slice(0, 6)}...{authResult.address.slice(-4)}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Go Home
              </Button>
              <Button 
                onClick={checkAuth}
                className="flex-1 bg-lime-400 hover:bg-lime-500 text-black"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User is authorized, render the admin content
  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-lime-400 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-white font-semibold">Admin Panel</h1>
              <p className="text-xs text-gray-400">
                Authorized Creator • {authResult.address?.slice(0, 6)}...{authResult.address?.slice(-4)}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => router.push("/")}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Exit Admin
          </Button>
        </div>
      </div>

      {/* Admin Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
} 