"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DeployPage() {
  const router = useRouter()
  const [isDeploying, setIsDeploying] = useState(false)
  const [formData, setFormData] = useState({
    contractName: "",
    contractAddress: "",
    network: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsDeploying(true)

    // Simulate deployment process
    setTimeout(() => {
      setIsDeploying(false)
      router.push("/contracts")
    }, 3000)
  }

  const networks = ["AssetHub", "Moonbeam", "Astar", "Acala", "Parallel", "Centrifuge"]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/contracts">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deploy Smart Contract</h1>
          <p className="text-gray-600">Add your deployed smart contract to the benchmark dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Contract Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contractName">Contract Name</Label>
                  <Input
                    id="contractName"
                    placeholder="e.g., DeFi Swap Contract"
                    value={formData.contractName}
                    onChange={(e) => setFormData({ ...formData, contractName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractAddress">Contract Address</Label>
                  <Input
                    id="contractAddress"
                    placeholder="0x..."
                    value={formData.contractAddress}
                    onChange={(e) => setFormData({ ...formData, contractAddress: e.target.value })}
                    required
                  />
                  <p className="text-sm text-gray-500">Enter the address of your already deployed smart contract</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="network">Network</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, network: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a network" />
                    </SelectTrigger>
                    <SelectContent>
                      {networks.map((network) => (
                        <SelectItem key={network} value={network}>
                          {network}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your contract's functionality..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  disabled={isDeploying}
                >
                  {isDeploying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Contract...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Contract to Dashboard
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supported Networks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {networks.map((network) => (
                  <Badge key={network} variant="outline">
                    {network}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                <p>Contract verification and validation</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                <p>Bytecode analysis and extraction</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                <p>Performance benchmarking setup</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                <p>Dashboard integration and monitoring</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
