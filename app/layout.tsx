import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { validateEnv } from "@/lib/env"

const inter = Inter({ subsets: ["latin"] })

// Validate environment variables on app startup
if (typeof window === "undefined") {
  validateEnv()
}

export const metadata: Metadata = {
  title: "Polkadot Benchmark Dashboard",
  description: "Smart contract benchmarking dashboard for Polkadot ecosystem",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  )
}
