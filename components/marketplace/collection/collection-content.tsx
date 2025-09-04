"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Filter, ChevronDown, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NftCardDiscover } from "@/components/ui/nft-card-discover"

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rarity", label: "Rarity" },
]

interface CollectionContentProps {
  collectionId: string
}

export default function CollectionContent({ collectionId }: CollectionContentProps) {
  const [activeTab, setActiveTab] = useState("items")
  const [sortBy, setSortBy] = useState("newest")
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [collectionName, setCollectionName] = useState<string>("")

  const selectedOption = sortOptions.find((option) => option.value === sortBy)

  // Fetch collection name
  const fetchCollectionName = async () => {
    try {
      const response = await fetch(`/api/collections?id=${collectionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.collection && data.collection.name) {
          setCollectionName(data.collection.name);
        }
      }
    } catch (error) {
      console.error("Error fetching collection name:", error);
    }
  };

  const fetchItems = async (pageNum: number, sort: string, reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/collections/${collectionId}/items?page=${pageNum}&limit=20&sortBy=${sort}`);
      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setItems(data.items);
        } else {
          setItems(prev => [...prev, ...data.items]);
        }
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collectionId) {
      setPage(1);
      setItems([]);
      fetchCollectionName();
      fetchItems(1, sortBy, true);
    }
  }, [collectionId, sortBy]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchItems(nextPage, sortBy);
    }
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
    setItems([]);
    fetchItems(1, newSort, true);
  };

  return (
    <div className="py-8 space-y-8">
      {/* Navigation Tabs and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setActiveTab("items")}
            className={`pb-2 border-b-2 transition-colors ${activeTab === "items"
              ? "border-green-500 text-white"
              : "border-transparent text-gray-400 hover:text-white"
              }`}
          >
            Items
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`pb-2 border-b-2 transition-colors ${activeTab === "activities"
              ? "border-green-500 text-white"
              : "border-transparent text-gray-400 hover:text-white"
              }`}
          >
            Activities
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[200px] justify-between"
              >
                <span>{selectedOption?.label || "Newest"}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[200px]">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer flex items-center justify-between"
                >
                  <span className={sortBy === option.value ? "text-green-400" : "text-white"}>{option.label}</span>
                  {sortBy === option.value && <Check className="w-4 h-4 text-green-400" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="border-gray-700">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Items Grid */}
      {activeTab === "items" && (
        <>
          {loading && items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400">Loading items...</div>
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item, index) => {
                console.log("Item data:", item); // Debug log
                return (
                  <NftCardDiscover 
                    key={item.id || index} 
                    nft={{
                      name: item.name,
                      image: item.image,
                      collectionName: collectionName || "Unknown Collection",
                      verified: true,
                      price: item.saleData?.price || item.price || "-",
                      isPriceLoading: false,
                      liquidId: item.id?.toString() || "",
                      saleType: item.saleData?.saleType,
                      endTime: item.saleData?.endTime ? Math.floor(new Date(item.saleData.endTime).getTime() / 1000) : undefined
                    }} 
                    index={index} 
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400">No items found in this collection.</div>
            </div>
          )}
        </>
      )}

      {/* Activities Tab Content */}
      {activeTab === "activities" && (
        <div className="text-center py-16">
          <p className="text-gray-400">Collection activities coming soon...</p>
        </div>
      )}

      {/* Load More Button */}
      {activeTab === "items" && hasMore && (
        <div className="text-center">
          <Button 
            variant="outline" 
            className="border-gray-700 hover:border-green-500"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}
