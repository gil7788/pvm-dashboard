"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/contracts", label: "Contracts" },
    { href: "/deploy", label: "Deploy" },
  ]

  return (
    <>
      {/* Main Navigation */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-semibold text-lg">Polkadot Benchmark</span>
              </Link>

              <nav className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-pink-600",
                      pathname === item.href ? "text-pink-600 border-b-2 border-pink-600 pb-4" : "text-gray-600",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <Button variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50 bg-transparent">
              Connect Wallet
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}
