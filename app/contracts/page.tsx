"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Plus, Search, ArrowUpDown } from "lucide-react"
import Link from "next/link"

// Mock data for deployed contracts
const contracts = [
  {
    id: "1",
    name: "DeFi Swap Contract",
    solidityAddress: "0x1234...5678",
    solidityDeployedTime: "2024-01-15 14:30:22",
    inkAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    inkDeployedTime: "2024-01-15 14:35:18",
    network: "Passethub",
    contractType: "both",
  },
  {
    id: "2",
    name: "NFT Marketplace",
    solidityAddress: "0xabcd...efgh",
    solidityDeployedTime: "2024-01-14 09:15:45",
    inkAddress: null,
    inkDeployedTime: null,
    network: "Passethub",
    contractType: "solidity",
  },
  {
    id: "3",
    name: "Governance Token",
    solidityAddress: null,
    solidityDeployedTime: null,
    inkAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    inkDeployedTime: "2024-01-13 16:45:12",
    network: "Passethub",
    contractType: "ink",
  },
  {
    id: "4",
    name: "Staking Pool",
    solidityAddress: "0xdef0...1234",
    solidityDeployedTime: "2024-01-12 11:20:33",
    inkAddress: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
    inkDeployedTime: "2024-01-12 11:25:45",
    network: "Passethub",
    contractType: "both",
  },
]

type SortField = "name" | "network" | "inkDeployedTime" | "solidityDeployedTime"
type SortOrder = "asc" | "desc"

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [networkFilter, setNetworkFilter] = useState<string>("all")
  const [contractTypeFilter, setContractTypeFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("solidityDeployedTime")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const filteredAndSortedContracts = useMemo(() => {
    const filtered = contracts.filter((contract) => {
      const matchesSearch =
        contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.solidityAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.inkAddress?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesNetwork = networkFilter === "all" || contract.network === networkFilter
      const matchesType = contractTypeFilter === "all" || contract.contractType === contractTypeFilter

      return matchesSearch && matchesNetwork && matchesType
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (sortField === "solidityDeployedTime" || sortField === "inkDeployedTime") {
        aValue = aValue ? new Date(aValue as string).getTime() : 0
        bValue = bValue ? new Date(bValue as string).getTime() : 0
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return filtered
  }, [searchTerm, networkFilter, contractTypeFilter, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Contracts</h1>
          <p className="text-gray-600">Monitor and analyze deployed smart contracts across Polkadot networks</p>
        </div>
        <Link href="/deploy">
          <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Deploy New Contract
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={networkFilter} onValueChange={setNetworkFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Networks</SelectItem>
                <SelectItem value="Passethub">Passethub</SelectItem>
              </SelectContent>
            </Select>

            <Select value={contractTypeFilter} onValueChange={setContractTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Contract Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="solidity">Solidity Only</SelectItem>
                <SelectItem value="ink">ink! Only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredAndSortedContracts.length} of {contracts.length} contracts
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deployed Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("name")} className="h-auto p-0 font-semibold">
                    Contract Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("network")} className="h-auto p-0 font-semibold">
                    Network
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>ink! Address</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("inkDeployedTime")}
                    className="h-auto p-0 font-semibold"
                  >
                    ink! Deployed Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Solidity Address</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("solidityDeployedTime")}
                    className="h-auto p-0 font-semibold"
                  >
                    Solidity Deployed Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{contract.network}</Badge>
                  </TableCell>
                  <TableCell>
                    {contract.inkAddress ? (
                      <span className="font-mono text-sm">{contract.inkAddress}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {contract.inkDeployedTime ? (
                      <span className="text-sm">{contract.inkDeployedTime}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {contract.solidityAddress ? (
                      <span className="font-mono text-sm">{contract.solidityAddress}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {contract.solidityDeployedTime ? (
                      <span className="text-sm">{contract.solidityDeployedTime}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/contract/${contract.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
