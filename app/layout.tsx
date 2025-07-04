"use client"
import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { usePathname } from "next/navigation"
import Web3Provider from "@/components/providers/web3-provider"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isMarketplace = pathname.startsWith("/marketplace")

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-black text-white`}>
        <Web3Provider>
          {!isMarketplace && <Header />}
          <main className="flex-1">{children}</main>
          {!isMarketplace && <Footer />}
        </Web3Provider>
      </body>
    </html>
  )
}
