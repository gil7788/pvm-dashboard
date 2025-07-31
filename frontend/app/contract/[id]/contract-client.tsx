"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Clock, Zap, Code, Activity, ChevronDown, ChevronRight, Play, Loader2 } from "lucide-react"
import Link from "next/link"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ContractData, ContractABI, ContractBytecode, ContractFunctions, ContractAnalytics } from "@/types/types"

interface ContractClientProps {
  contractData: ContractData
}

export function ContractClient({ contractData }: ContractClientProps) {
  const [benchmarkInputs, setBenchmarkInputs] = useState<{ [key: string]: string }>({})
  const [isOpenSolidity, setIsOpenSolidity] = useState(false)
  const [isOpenInk, setIsOpenInk] = useState(false)
  
  // State for backend data
  const [abiData, setAbiData] = useState<ContractABI | null>(null)
  const [bytecodeData, setBytecodeData] = useState<ContractBytecode | null>(null)
  const [functionsData, setFunctionsData] = useState<ContractFunctions | null>(null)
  const [analyticsData, setAnalyticsData] = useState<ContractAnalytics | null>(null)
  const [loading, setLoading] = useState({
    abi: false,
    bytecode: false,
    functions: false,
    analytics: false
  })
  const [error, setError] = useState<string | null>(null)

  // Function to load ABI data
  const loadABI = async () => {
    if (abiData) return // Already loaded
    setLoading(prev => ({ ...prev, abi: true }))
    try {
      const response = await fetch(`/api/contracts/${contractData.metadata.id}/abi`)
      if (!response.ok) throw new Error('Failed to load ABI')
      const data = await response.json()
      setAbiData(data)
    } catch (err) {
      setError('Failed to load ABI data')
      console.error('Error loading ABI:', err)
    } finally {
      setLoading(prev => ({ ...prev, abi: false }))
    }
  }

  // Function to load bytecode data
  const loadBytecode = async () => {
    if (bytecodeData) return // Already loaded
    setLoading(prev => ({ ...prev, bytecode: true }))
    try {
      const response = await fetch(`/api/contracts/${contractData.metadata.id}/bytecode`)
      if (!response.ok) throw new Error('Failed to load bytecode')
      const data = await response.json()
      setBytecodeData(data)
    } catch (err) {
      setError('Failed to load bytecode data')
      console.error('Error loading bytecode:', err)
    } finally {
      setLoading(prev => ({ ...prev, bytecode: false }))
    }
  }

  // Function to load functions data
  const loadFunctions = async () => {
    if (functionsData) return // Already loaded
    setLoading(prev => ({ ...prev, functions: true }))
    try {
      const response = await fetch(`/api/contracts/${contractData.metadata.id}/functions`)
      if (!response.ok) throw new Error('Failed to load functions')
      const data = await response.json()
      setFunctionsData(data)
    } catch (err) {
      setError('Failed to load functions data')
      console.error('Error loading functions:', err)
    } finally {
      setLoading(prev => ({ ...prev, functions: false }))
    }
  }

  // Function to load analytics data
  const loadAnalytics = async () => {
    if (analyticsData) return // Already loaded
    setLoading(prev => ({ ...prev, analytics: true }))
    try {
      const response = await fetch(`/api/contracts/${contractData.metadata.id}/analytics`)
      if (!response.ok) throw new Error('Failed to load analytics')
      const data = await response.json()
      setAnalyticsData(data)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Error loading analytics:', err)
    } finally {
      setLoading(prev => ({ ...prev, analytics: false }))
    }
  }

  const runBenchmark = async (functionName: string, contractType: "solidity" | "ink") => {
    console.log(`Running benchmark for ${functionName} on ${contractType}`)
    // TODO: Implement actual benchmark call to backend
    try {
      const response = await fetch(`/api/contracts/${contractData.metadata.id}/benchmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionName,
          contractType,
          inputs: benchmarkInputs[`${contractType}-${functionName}`] || ''
        })
      })
      if (!response.ok) throw new Error('Benchmark failed')
      const result = await response.json()
      console.log('Benchmark result:', result)
      // Reload functions data to get updated metrics
      setFunctionsData(null)
      loadFunctions()
    } catch (err) {
      setError('Failed to run benchmark')
      console.error('Error running benchmark:', err)
    }
  }

  // Function to handle tab changes and load data
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'abi':
        loadABI()
        break
      case 'bytecode':
        loadBytecode()
        break
      case 'benchmark':
        loadFunctions()
        break
      case 'analytics':
        loadAnalytics()
        break
    }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{contractData.metadata.name}</h1>
            <div className="space-y-1">
              {contractData.metadata.solidityAddress && (
                <p className="text-gray-600 font-mono text-sm">
                  <span className="text-blue-600 font-medium">Solidity:</span> {contractData.metadata.solidityAddress}
                </p>
              )}
              {contractData.metadata.inkAddress && (
                <p className="text-gray-600 font-mono text-sm">
                  <span className="text-green-600 font-medium">ink!:</span> {contractData.metadata.inkAddress}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {contractData.metadata.contractType === "both" && (
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
            <div className="text-2xl font-bold">{contractData.metadata.network}</div>
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

      <Tabs defaultValue="metadata" className="space-y-4" onValueChange={handleTabChange}>
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
                    <p className="font-mono text-sm">{contractData.metadata.solidityAddress}</p>
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
                    <p className="font-mono text-sm">{contractData.metadata.inkAddress}</p>
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
            {loading.abi && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading ABI...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {abiData?.solidity && (
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
                        {JSON.stringify(abiData.solidity, null, 2)}
                      </pre>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {abiData?.ink && (
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
                        {JSON.stringify(abiData.ink, null, 2)}
                      </pre>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {!loading.abi && !abiData?.solidity && !abiData?.ink && (
              <div className="text-center p-8 text-gray-500">
                No ABI data available for this contract.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bytecode" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading.bytecode && (
              <div className="col-span-2 flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading bytecode...</span>
              </div>
            )}

            {bytecodeData?.solidity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600">
                    <Code className="mr-2 h-5 w-5" />
                    Solidity Bytecode ({bytecodeData.solidity.size})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-auto">
                    <code className="text-xs font-mono break-all">{bytecodeData.solidity.bytecode}</code>
                  </div>
                </CardContent>
              </Card>
            )}

            {bytecodeData?.ink && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Code className="mr-2 h-5 w-5" />
                    ink! Bytecode ({bytecodeData.ink.size})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-auto">
                    <code className="text-xs font-mono break-all">{bytecodeData.ink.bytecode}</code>
                  </div>
                </CardContent>
              </Card>
            )}

            {!loading.bytecode && !bytecodeData?.solidity && !bytecodeData?.ink && (
              <div className="col-span-2 text-center p-8 text-gray-500">
                No bytecode data available for this contract.
              </div>
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
              {loading.functions && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading functions...</span>
                </div>
              )}

              {!loading.functions && (
                <div className="space-y-6">
                  {functionsData?.solidity.map((func, index) => (
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
                            value={benchmarkInputs[`solidity-${func.name}`] || ""}
                            onChange={(e) =>
                              setBenchmarkInputs({ ...benchmarkInputs, [`solidity-${func.name}`]: e.target.value })
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

                  {functionsData?.ink.map((func, index) => (
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

                  {!functionsData?.solidity.length && !functionsData?.ink.length && (
                    <div className="text-center p-8 text-gray-500">
                      No functions available for benchmarking.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {loading.analytics && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading analytics...</span>
            </div>
          )}

          {!loading.analytics && analyticsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gas Consumption Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2">Deployment Gas</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-600">Solidity</p>
                          <p className="font-semibold">{analyticsData.gasConsumption.solidity.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-600">ink!</p>
                          <p className="font-semibold">{analyticsData.gasConsumption.ink.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2">Average Benchmark Gas</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-600">Solidity</p>
                          <p className="font-semibold">{Math.round(analyticsData.summary.averageGasUsed).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-600">ink!</p>
                          <p className="font-semibold">-</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Runtime Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2">Average Execution Time</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-600">Solidity</p>
                          <p className="font-semibold">{Math.round(analyticsData.summary.averageRuntime)}ms</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-600">ink!</p>
                          <p className="font-semibold">-</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2">Total Benchmarks</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-600">Solidity</p>
                          <p className="font-semibold">{analyticsData.summary.totalBenchmarks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-green-600">ink!</p>
                          <p className="font-semibold">-</p>
                        </div>
                      </div>
                    </div>
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
                      <span className="font-semibold">{analyticsData.bytecodeSize.solidity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600">ink! Bytecode</span>
                      <span className="font-semibold">{analyticsData.bytecodeSize.ink}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Benchmarks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analyticsData.benchmarks.slice(0, 3).map((benchmark, index) => (
                      <div key={index} className="border-b pb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{benchmark.type}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(benchmark.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Gas: {benchmark.results.gasUsed.toLocaleString()} | 
                          Time: {Math.round(benchmark.results.executionTime)}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!loading.analytics && !analyticsData && (
            <div className="text-center p-8 text-gray-500">
              No analytics data available for this contract.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
