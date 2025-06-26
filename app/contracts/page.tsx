import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Plus } from "lucide-react"
import Link from "next/link"

// Mock data for deployed contracts
const contracts = [
  {
    id: "1",
    name: "DeFi Swap Contract",
    address: "0x1234...5678",
    deployedTime: "2024-01-15 14:30:22",
    status: "success",
    network: "AssetHub",
  },
  {
    id: "2",
    name: "NFT Marketplace",
    address: "0xabcd...efgh",
    deployedTime: "2024-01-14 09:15:45",
    status: "success",
    network: "Moonbeam",
  },
  {
    id: "3",
    name: "Governance Token",
    address: "0x9876...5432",
    deployedTime: "2024-01-13 16:45:12",
    status: "failure",
    network: "Astar",
  },
  {
    id: "4",
    name: "Staking Pool",
    address: "0xdef0...1234",
    deployedTime: "2024-01-12 11:20:33",
    status: "success",
    network: "AssetHub",
  },
]

export default function ContractsPage() {
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

      <Card>
        <CardHeader>
          <CardTitle>Deployed Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Name</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Deployed Address</TableHead>
                <TableHead>Deployed Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{contract.network}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{contract.address}</TableCell>
                  <TableCell>{contract.deployedTime}</TableCell>
                  <TableCell>
                    <Badge
                      variant={contract.status === "success" ? "default" : "destructive"}
                      className={contract.status === "success" ? "bg-green-100 text-green-800" : ""}
                    >
                      {contract.status}
                    </Badge>
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
