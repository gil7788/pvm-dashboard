"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, Plus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DeployPage() {
  const router = useRouter()
  const [isDeploying, setIsDeploying] = useState(false)
  const [abiMismatchWarning, setAbiMismatchWarning] = useState(false)
  const [formData, setFormData] = useState({
    contractName: "",
    chain: "",
    solidityAddress: "",
    solidityAbi: "",
    inkAddress: "",
    inkAbi: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsDeploying(true)

    // Check ABI compatibility
    if (formData.solidityAbi && formData.inkAbi) {
      try {
        const solAbi = JSON.parse(formData.solidityAbi)
        const inkAbi = JSON.parse(formData.inkAbi)

        // Simple check for function name compatibility
        const solFunctions = solAbi.filter((item: any) => item.type === "function").map((item: any) => item.name)
        const inkMessages = inkAbi.spec?.messages?.map((msg: any) => msg.name) || []

        const hasCommonFunctions = solFunctions.some((func: string) =>
          inkMessages.some((msg: string) => func.toLowerCase() === msg.toLowerCase().replace("_", "")),
        )

        if (!hasCommonFunctions) {
          setAbiMismatchWarning(true)
        }
      } catch (error) {
        console.error("ABI parsing error:", error)
      }
    }

    // Simulate deployment process
    setTimeout(() => {
      setIsDeploying(false)
      // Redirect to the newly created contract page
      router.push("/contract/new-contract-id")
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

      {abiMismatchWarning && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>ABI Mismatch Warning:</strong> The Solidity and ink! ABIs don't appear to have matching functions.
            This may affect benchmarking capabilities, but you can still proceed with contract creation.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
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
                  <Label htmlFor="contractName">Contract Name *</Label>
                  <Input
                    id="contractName"
                    placeholder="e.g., DeFi Swap Contract"
                    value={formData.contractName}
                    onChange={(e) => setFormData({ ...formData, contractName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chain">Chain *</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, chain: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select deployment chain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passethub">Passethub</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Solidity Section */}
                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="font-semibold text-blue-600 flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      Solidity Contract
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="solidityAddress">Solidity Address</Label>
                      <Input
                        id="solidityAddress"
                        placeholder="0x..."
                        value={formData.solidityAddress}
                        onChange={(e) => setFormData({ ...formData, solidityAddress: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="solidityAbi">Solidity ABI</Label>
                      <Textarea
                        id="solidityAbi"
                        placeholder="Paste Solidity ABI JSON here..."
                        value={formData.solidityAbi}
                        onChange={(e) => setFormData({ ...formData, solidityAbi: e.target.value })}
                        rows={6}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* ink! Section */}
                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="font-semibold text-green-600 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      ink! Contract
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="inkAddress">ink! Address</Label>
                      <Input
                        id="inkAddress"
                        placeholder="5..."
                        value={formData.inkAddress}
                        onChange={(e) => setFormData({ ...formData, inkAddress: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inkAbi">ink! ABI</Label>
                      <Textarea
                        id="inkAbi"
                        placeholder="Paste ink! metadata JSON here..."
                        value={formData.inkAbi}
                        onChange={(e) => setFormData({ ...formData, inkAbi: e.target.value })}
                        rows={6}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
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
                  disabled={isDeploying || (!formData.solidityAddress && !formData.inkAddress) || !formData.chain}
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
      </div>
    </div>
  )
}
