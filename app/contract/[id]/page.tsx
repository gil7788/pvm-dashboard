"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Clock, Zap, Code, Activity, ChevronDown, ChevronRight, Play } from "lucide-react"
import Link from "next/link"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Mock contract data
const contractData = {
  id: "1",
  name: "DeFi Swap Contract",
  solidityAddress: "0x1234567890abcdef1234567890abcdef12345678",
  inkAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  network: "AssetHub",
  status: "success",
  deployedTime: "2024-01-15 14:30:22",
  contractType: "both",
  solidity: {
    gasConsumption: "2,450,000",
    bytecode: "0x608060405234801561001057600080fd5b50...",
    bytecodeSize: "12.5 KB",
    abi: [
      {
        inputs: [{ name: "amount", type: "uint256" }],
        name: "swap",
        outputs: [{ name: "", type: "bool" }],
        type: "function",
      },
    ],
    functions: [
      { name: "swap", gasUsed: "45,000", runtime: "12ms", lastTested: "2024-01-15" },
      { name: "addLiquidity", gasUsed: "65,000", runtime: "18ms", lastTested: "2024-01-15" },
    ],
  },
  ink: {
    gasConsumption: "1,850,000",
    bytecode: "0x0061736d0100000001...",
    bytecodeSize: "8.2 KB",
    abi: {
      spec: {
        constructors: [],
        messages: [
          {
            args: [{ name: "amount", type: { displayName: ["u128"], type: 0 } }],
            name: "swap",
            returnType: { displayName: ["bool"], type: 1 },
          },
        ],
      },
    },
    functions: [
      { name: "swap", gasUsed: "32,000", runtime: "8ms", lastTested: "2024-01-15" },
      { name: "add_liquidity", gasUsed: "48,000", runtime: "11ms", lastTested: "2024-01-15" },
    ],
  },
}

export default function ContractPage({ params }: { params: { id: string } }) {
  const [benchmarkInputs, setBenchmarkInputs] = useState<{ [key: string]: string }>({})
  const [isOpenSolidity, setIsOpenSolidity] = useState(false)
  const [isOpenInk, setIsOpenInk] = useState(false)

  const runBenchmark = (functionName: string, contractType: "solidity" | "ink") => {
    console.log(`Running benchmark for ${functionName} on ${contractType}`)
    // Implement benchmark logic here
  }

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
            <div className="space-y-1">
              {contractData.solidityAddress && (
                <p className="text-gray-600 font-mono text-sm">
                  <span className="text-blue-600 font-medium">Solidity:</span> {contractData.solidityAddress}
                </p>
              )}
              {contractData.inkAddress && (
                <p className="text-gray-600 font-mono text-sm">
                  <span className="text-green-600 font-medium">ink!:</span> {contractData.inkAddress}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {contractData.contractType === "both" && (
              <Badge variant="default" className="bg-purple-100 text-purple-800">
                Solidity + ink!
              </Badge>
            )}
            <Badge variant="default" className="bg-green-100 text-green-800">
              {contractData.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <CardTitle className="text-sm font-medium">Solidity Gas</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractData.solidity?.gasConsumption || "N/A"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ink! Gas</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractData.ink?.gasConsumption || "N/A"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{contractData.deployedTime}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metadata" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="abi">ABI</TabsTrigger>
          <TabsTrigger value="bytecode">PVM Bytecode</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="metadata" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contractData.solidity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600">
                    <Code className="mr-2 h-5 w-5" />
                    Solidity Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contract Address</p>
                    <p className="font-mono text-sm">{contractData.solidityAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gas Consumption</p>
                    <p className="text-lg font-semibold">{contractData.solidity.gasConsumption}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bytecode Size</p>
                    <p className="text-lg font-semibold">{contractData.solidity.bytecodeSize}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {contractData.ink && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Code className="mr-2 h-5 w-5" />
                    ink! Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contract Address</p>
                    <p className="font-mono text-sm">{contractData.inkAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gas Consumption</p>
                    <p className="text-lg font-semibold">{contractData.ink.gasConsumption}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bytecode Size</p>
                    <p className="text-lg font-semibold">{contractData.ink.bytecodeSize}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="abi" className="space-y-4">
          <div className="space-y-4">
            {contractData.solidity && (
              <Collapsible open={isOpenSolidity} onOpenChange={setIsOpenSolidity}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50">
                      <CardTitle className="flex items-center justify-between text-blue-600">
                        <div className="flex items-center">
                          <Code className="mr-2 h-5 w-5" />
                          Solidity ABI
                        </div>
                        {isOpenSolidity ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                        {JSON.stringify(contractData.solidity.abi, null, 2)}
                      </pre>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {contractData.ink && (
              <Collapsible open={isOpenInk} onOpenChange={setIsOpenInk}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50">
                      <CardTitle className="flex items-center justify-between text-green-600">
                        <div className="flex items-center">
                          <Code className="mr-2 h-5 w-5" />
                          ink! ABI
                        </div>
                        {isOpenInk ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                        {JSON.stringify(contractData.ink.abi, null, 2)}
                      </pre>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bytecode" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contractData.solidity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600">
                    <Code className="mr-2 h-5 w-5" />
                    Solidity Bytecode ({contractData.solidity.bytecodeSize})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-auto">
                    <code className="text-xs font-mono break-all">{contractData.solidity.bytecode}...</code>
                  </div>
                </CardContent>
              </Card>
            )}

            {contractData.ink && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Code className="mr-2 h-5 w-5" />
                    ink! Bytecode ({contractData.ink.bytecodeSize})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-auto">
                    <code className="text-xs font-mono break-all">{contractData.ink.bytecode}...</code>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="benchmark" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Function Benchmarking</CardTitle>
              <p className="text-sm text-gray-600">Test and compare function performance between Solidity and ink!</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {contractData.solidity?.functions.map((func, index) => (
                  <div key={`sol-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-blue-600">Solidity: {func.name}</h4>
                      <Button size="sm" onClick={() => runBenchmark(func.name, "solidity")}>
                        <Play className="mr-2 h-4 w-4" />
                        Run Test
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`sol-input-${index}`}>Input Parameters</Label>
                        <Input
                          id={`sol-input-${index}`}
                          placeholder="Enter test values..."
                          value={benchmarkInputs[`sol-${func.name}`] || ""}
                          onChange={(e) =>
                            setBenchmarkInputs({ ...benchmarkInputs, [`sol-${func.name}`]: e.target.value })
                          }
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Gas Used</p>
                        <p className="text-lg font-semibold">{func.gasUsed}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Runtime</p>
                        <p className="text-lg font-semibold">{func.runtime}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {contractData.ink?.functions.map((func, index) => (
                  <div key={`ink-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-green-600">ink!: {func.name}</h4>
                      <Button size="sm" onClick={() => runBenchmark(func.name, "ink")}>
                        <Play className="mr-2 h-4 w-4" />
                        Run Test
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`ink-input-${index}`}>Input Parameters</Label>
                        <Input
                          id={`ink-input-${index}`}
                          placeholder="Enter test values..."
                          value={benchmarkInputs[`ink-${func.name}`] || ""}
                          onChange={(e) =>
                            setBenchmarkInputs({ ...benchmarkInputs, [`ink-${func.name}`]: e.target.value })
                          }
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Gas Used</p>
                        <p className="text-lg font-semibold">{func.gasUsed}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Runtime</p>
                        <p className="text-lg font-semibold">{func.runtime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gas Consumption Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contractData.solidity?.functions.map((solFunc, index) => {
                    const inkFunc = contractData.ink?.functions.find(
                      (f) => f.name.toLowerCase().replace("_", "") === solFunc.name.toLowerCase(),
                    )
                    return (
                      <div key={index} className="border-b pb-4">
                        <h4 className="font-medium mb-2">{solFunc.name}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-blue-600">Solidity</p>
                            <p className="font-semibold">{solFunc.gasUsed}</p>
                          </div>
                          {inkFunc && (
                            <div>
                              <p className="text-sm text-green-600">ink!</p>
                              <p className="font-semibold">{inkFunc.gasUsed}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Runtime Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contractData.solidity?.functions.map((solFunc, index) => {
                    const inkFunc = contractData.ink?.functions.find(
                      (f) => f.name.toLowerCase().replace("_", "") === solFunc.name.toLowerCase(),
                    )
                    return (
                      <div key={index} className="border-b pb-4">
                        <h4 className="font-medium mb-2">{solFunc.name}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-blue-600">Solidity</p>
                            <p className="font-semibold">{solFunc.runtime}</p>
                          </div>
                          {inkFunc && (
                            <div>
                              <p className="text-sm text-green-600">ink!</p>
                              <p className="font-semibold">{inkFunc.runtime}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bytecode Size Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">Solidity Bytecode</span>
                    <span className="font-semibold">{contractData.solidity?.bytecodeSize}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">ink! Bytecode</span>
                    <span className="font-semibold">{contractData.ink?.bytecodeSize}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Last Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Solidity Functions</span>
                    <span className="text-sm text-gray-500">{contractData.solidity?.functions[0]?.lastTested}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ink! Functions</span>
                    <span className="text-sm text-gray-500">{contractData.ink?.functions[0]?.lastTested}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
