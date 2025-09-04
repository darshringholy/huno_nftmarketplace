"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Check, 
  X, 
  Clock, 
  Eye,
  ArrowUpRight,
  Filter,
  Search
} from "lucide-react"
import AdminProtected from "@/components/auth/AdminProtected"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Collection {
  _id: string
  name: string
  logoUrl: string
  bannerUrl: string
  description: string
  website: string
  contractAddress: string
  royalty: string
  royaltyWallet: string
  blockchain: string
  twitter: string
  telegram: string
  discord: string
  medium: string
  facebook: string
  walletAddress: string
  status: 'pending' | 'approved' | 'rejected'
  verified: boolean
  createdAt: string
  updatedAt: string
  adminNotes?: string
}

// Helper functions moved outside component
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-yellow-500 text-black"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
    case 'approved':
      return <Badge className="bg-green-500 text-black"><Check className="w-3 h-3 mr-1" />Approved</Badge>
    case 'rejected':
      return <Badge className="bg-red-500 text-black"><X className="w-3 h-3 mr-1" />Rejected</Badge>
    default:
      return null
  }
}

const getVerificationBadge = (verified: boolean) => {
  if (verified) {
    return <Badge className="bg-lime-400 text-black"><Check className="w-3 h-3 mr-1" />Verified</Badge>
  }
  return <Badge variant="outline" className="text-gray-400">Unverified</Badge>
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const shortenAddress = (address: string) => {
  return address.slice(0, 6) + '...' + address.slice(-4)
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [updating, setUpdating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/collections?admin=true`)
      if (response.ok) {
        const data = await response.json()
        setCollections(data.collections || [])
      }
    } catch (error) {
      console.error("Error fetching collections:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (collectionId: string, status: 'approved' | 'rejected', verified: boolean = false) => {
    try {
      setUpdating(true)
      const response = await fetch("/api/collections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: collectionId,
          status,
          verified,
          adminNotes: adminNotes || undefined
        })
      })

      if (response.ok) {
        await fetchCollections()
        setSelectedCollection(null)
        setAdminNotes("")
      }
    } catch (error) {
      console.error("Error updating collection:", error)
    } finally {
      setUpdating(false)
    }
  }

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCollections = filteredCollections.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <AdminProtected>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Collection Submission</h1>
          </div>
        </div>

        {/* Activities Table */}
        <Card className="bg-[#141414] border-gray-800">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading collections...</div>
            ) : filteredCollections.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No collections found</div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 bg-[#141414]">
                  <div className="col-span-3 font-semibold text-white">Collection Name</div>
                  <div className="col-span-3 font-semibold text-white">From</div>
                  <div className="col-span-2 font-semibold text-white">Date</div>
                  <div className="col-span-2 font-semibold text-white">Listing</div>
                  <div className="col-span-1 font-semibold text-white">Verified</div>
                  <div className="col-span-1 font-semibold text-white"></div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-gray-700">
                  {currentCollections.map((collection) => (
                    <div key={collection._id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-800 transition-colors">
                      {/* Collection Name */}
                      <div className="col-span-3 flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded flex-shrink-0">
                          {collection.logoUrl ? (
                            <img 
                              src={collection.logoUrl} 
                              alt={collection.name} 
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-400">?</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{collection.name}</span>
                          {collection.verified && (
                            <div className="w-4 h-4 bg-lime-400 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-black" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* From */}
                      <div className="col-span-3 text-white flex items-center">
                        {shortenAddress(collection.walletAddress)}
                      </div>

                      {/* Date */}
                      <div className="col-span-2 text-gray-400 flex items-center">
                        {new Date(collection.createdAt).toLocaleDateString()}
                      </div>

                      {/* Listing Status */}
                      <div className="col-span-2 flex items-center space-x-2">
                        <Button
                          onClick={() => handleStatusUpdate(collection._id, 'approved', collection.verified)}
                          size="sm"
                          className="w-6 h-6 p-0 bg-green-500 hover:bg-green-600 rounded-full"
                          disabled={updating}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(collection._id, 'rejected', false)}
                          size="sm"
                          className="w-6 h-6 p-0 bg-red-500 hover:bg-red-600 rounded-full"
                          disabled={updating}
                        >
                          <X className="w-4 h-4 text-white" />
                        </Button>
                      </div>

                      {/* Verified Status */}
                      <div className="col-span-1 flex items-center space-x-2">
                        <Button
                          onClick={() => handleStatusUpdate(collection._id, 'approved', true)}
                          size="sm"
                          className="w-6 h-6 p-0 bg-green-500 hover:bg-green-600 rounded-full"
                          disabled={updating || collection.status !== 'approved'}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(collection._id, 'approved', false)}
                          size="sm"
                          className="w-6 h-6 p-0 bg-red-500 hover:bg-red-600 rounded-full"
                          disabled={updating || collection.status !== 'approved'}
                        >
                          <X className="w-4 h-4 text-white" />
                        </Button>
                      </div>

                      {/* Action Button */}
                      <div className="col-span-1 flex justify-end pt-2">
                        <Button
                          onClick={() => setSelectedCollection(collection)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              ←
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={currentPage === page 
                  ? "bg-lime-400 text-black hover:bg-lime-500" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
                }
              >
                {page}
              </Button>
            ))}
            
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              →
            </Button>
          </div>
        )}

        {/* Collection Detail Dialog */}
        <Dialog open={!!selectedCollection} onOpenChange={() => setSelectedCollection(null)}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Collection Details</DialogTitle>
            </DialogHeader>
            {selectedCollection && (
              <div className="space-y-6">
                {/* Collection Images */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Logo</label>
                    <img 
                      src={selectedCollection.logoUrl} 
                      alt="Logo" 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Banner</label>
                    <img 
                      src={selectedCollection.bannerUrl} 
                      alt="Banner" 
                      className="w-full h-32 object-cover rounded-lg border border-gray-700"
                    />
                  </div>
                </div>

                {/* Collection Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Name</label>
                      <p className="text-white font-semibold">{selectedCollection.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Description</label>
                      <p className="text-white">{selectedCollection.description || "No description"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Website</label>
                      <p className="text-white">{selectedCollection.website || "No website"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Blockchain</label>
                      <p className="text-white">{selectedCollection.blockchain}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Contract Address</label>
                      <p className="text-white font-mono text-sm">{selectedCollection.contractAddress || "No contract"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Royalty</label>
                      <p className="text-white">{selectedCollection.royalty || "0"}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Creator Wallet</label>
                      <p className="text-white font-mono text-sm">{shortenAddress(selectedCollection.walletAddress)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Created</label>
                      <p className="text-white">{formatDate(selectedCollection.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {(selectedCollection.twitter || selectedCollection.telegram || selectedCollection.discord || selectedCollection.medium || selectedCollection.facebook) && (
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Social Links</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCollection.twitter && (
                        <Badge variant="outline" className="text-blue-400 border-blue-400">Twitter</Badge>
                      )}
                      {selectedCollection.telegram && (
                        <Badge variant="outline" className="text-blue-500 border-blue-500">Telegram</Badge>
                      )}
                      {selectedCollection.discord && (
                        <Badge variant="outline" className="text-purple-400 border-purple-400">Discord</Badge>
                      )}
                      {selectedCollection.medium && (
                        <Badge variant="outline" className="text-green-400 border-green-400">Medium</Badge>
                      )}
                      {selectedCollection.facebook && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">Facebook</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Admin Notes</label>
                  <Textarea
                    placeholder="Add notes about this collection..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  {selectedCollection.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(selectedCollection._id, 'approved', false)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={updating}
                      >
                        Approve (Unverified)
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedCollection._id, 'approved', true)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                        disabled={updating}
                      >
                        Approve & Verify
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedCollection._id, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        disabled={updating}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedCollection.status === 'approved' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(selectedCollection._id, 'approved', !selectedCollection.verified)}
                        className={selectedCollection.verified ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "bg-lime-400 hover:bg-lime-500 text-black"}
                        disabled={updating}
                      >
                        {selectedCollection.verified ? "Remove Verification" : "Mark as Verified"}
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedCollection._id, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        disabled={updating}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedCollection.status === 'rejected' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(selectedCollection._id, 'approved', false)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={updating}
                      >
                        Approve (Unverified)
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedCollection._id, 'approved', true)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                        disabled={updating}
                      >
                        Approve & Verify
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminProtected>
  )
} 