import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Zap, Code, Activity } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Mock contract data
const contractData = {
  id: "1",
  name: "DeFi Swap Contract",
  address: "0x1234567890abcdef1234567890abcdef12345678",
  network: "AssetHub",
  status: "success",
  deployedTime: "2024-01-15 14:30:22",
  gasConsumption: "2,450,000",
  pvmBytecode: "0x608060405234801561001057600080fd5b50...",
  evmBytecode: "0x6080604052348015600f57600080fd5b50...",
  metadata: {
    compiler: "solc 0.8.19",
    optimization: true,
    runs: 200,
  },
  benchmarks: {
    "1": { runtime: "45ms", gasUsed: "21,000" },
    "10": { runtime: "42ms", gasUsed: "20,500" },
    "100": { runtime: "38ms", gasUsed: "19,800" },
    "1000": { runtime: "35ms", gasUsed: "19,200" },
  },
}

export default function ContractPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/contracts">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{contractData.name}</h1>
            <p className="text-gray-600 font-mono text-sm">{contractData.address}</p>
          </div>
          <Badge variant="default" className="bg-green-100 text-green-800">
            {contractData.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractData.network}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas Consumption</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractData.gasConsumption}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractData.deployedTime}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bytecode" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bytecode">Bytecode & Metadata</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="bytecode" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="mr-2 h-5 w-5" />
                  PVM Bytecode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <code className="text-xs font-mono break-all">{contractData.pvmBytecode}...</code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="mr-2 h-5 w-5" />
                  EVM Bytecode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <code className="text-xs font-mono break-all">{contractData.evmBytecode}...</code>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Compiler</p>
                  <p className="text-lg font-semibold">{contractData.metadata.compiler}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Optimization</p>
                  <p className="text-lg font-semibold">{contractData.metadata.optimization ? "Enabled" : "Disabled"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Runs</p>
                  <p className="text-lg font-semibold">{contractData.metadata.runs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Benchmarks</CardTitle>
              <p className="text-sm text-gray-600">Average runtime and gas consumption across multiple runs</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(contractData.benchmarks).map(([runs, data]) => (
                  <div key={runs} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {runs} Run{runs !== "1" ? "s" : ""}
                      </span>
                      <div className="flex space-x-4 text-sm">
                        <span>
                          Runtime: <strong>{data.runtime}</strong>
                        </span>
                        <span>
                          Gas: <strong>{data.gasUsed}</strong>
                        </span>
                      </div>
                    </div>
                    <Progress value={100 - Number.parseInt(runs) / 10} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
