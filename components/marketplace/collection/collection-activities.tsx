"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Check } from "lucide-react"
import ActivitiesTable from "@/components/marketplace/discover/activities-table"
import Image from "next/image"


const activityFilterOptions = [
    { value: "all", label: "All" },
    { value: "fixed-price", label: "Fixed Price" },
    { value: "abstract", label: "abstract" },
    { value: "with-buy-offer", label: "With Buy Offer" },
]

export default function CollectionActivities() {
    const [activityFilter, setActivityFilter] = useState("all")
    const selectedActivityOption = activityFilterOptions.find((option) => option.value === activityFilter)
    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="my-6">
                    <h2 className="text-xl md:text-2xl font-bold">Activities</h2>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 min-w-[200px] justify-between"
                        >
                            <span>{selectedActivityOption?.label || "All"}</span>
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white min-w-[200px]">
                        {activityFilterOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => setActivityFilter(option.value)}
                                className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer flex items-center justify-between"
                            >
                                <span className={activityFilter === option.value ? "text-green-400" : "text-white"}>
                                    {option.label}
                                </span>
                                {activityFilter === option.value && <Check className="w-4 h-4 text-green-400" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <ActivitiesTable activityFilter={activityFilter} />
        </div>
    )
}
