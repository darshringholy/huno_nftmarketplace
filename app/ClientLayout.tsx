"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Web3Provider from "@/components/providers/web3-provider";
import Web3ModalInitializer from "@/components/providers/Web3ModalInitializer";
import type { ReactNode } from "react";
import ClientOnly from "@/components/ClientOnly";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMarketplace = pathname.startsWith("/marketplace");
  const isProfile = pathname.startsWith("/profile");
  const isCollectionCreate =
    pathname === "/marketplace/collections/create" ||
    pathname === "/marketplace/collections/create/" ||
    pathname.startsWith("/marketplace/collections/create");

  return (
    <Web3Provider>
      <Web3ModalInitializer />
      <ClientOnly>
        {!isMarketplace && <Header />}
        <main className="flex-1">{children}</main>
        {!isMarketplace && !isProfile && !isCollectionCreate && <Footer />}
      </ClientOnly>
    </Web3Provider>
  );
} 