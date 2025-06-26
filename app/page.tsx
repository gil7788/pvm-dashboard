import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BarChart3, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-600/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Polkadot
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Benchmark
              </span>
              <br />
              Dashboard
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Monitor, analyze, and optimize your smart contract performance across the Polkadot ecosystem with
              comprehensive benchmarking tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/contracts">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg h-auto"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Contracts
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/deploy">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-pink-600 text-pink-600 hover:bg-pink-50 px-8 py-4 text-lg h-auto"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Deploy Contract
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Cards */}
        <div className="absolute top-20 left-10 hidden lg:block">
          <Card className="w-64 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Real-time Monitoring</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="absolute bottom-20 right-10 hidden lg:block">
          <Card className="w-64 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Gas Optimization</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
