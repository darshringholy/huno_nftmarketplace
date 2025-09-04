export const metadata = {
  title: "Hunos Marketplace",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    // Uncomment below if you add these files:
    // { rel: "icon", type: "image/png", url: "/favicon.png" },
    // { rel: "icon", type: "image/svg+xml", url: "/favicon.svg" },
  ],
};

import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

// Import startup script to start event listener
import "@/lib/startup";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen text-white`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
