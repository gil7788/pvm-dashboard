import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/contracts/${params.id}`)
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to fetch contract' }, { status: response.status })
    }
    
    // Transform backend data to frontend expected format
    const transformedData = {
      metadata: {
        id: data.id,
        name: data.name,
        network: data.network,
        contractType: data.contractType,
        solidityAddress: data.solidityAddress,
        inkAddress: data.inkAddress,
        solidityDeployedTime: data.solidityDeployedTime,
        inkDeployedTime: data.inkDeployedTime
      },
      status: "success",
      deployedTime: data.solidityDeployedTime || data.inkDeployedTime || "Unknown",
      solidity: data.solidityAddress ? {
        gasConsumption: "2,450,000",
        bytecode: "0x608060405234801561001057600080fd5b50...",
        bytecodeSize: "12.5 KB",
        abi: [],
        functions: []
      } : null,
      ink: data.inkAddress ? {
        gasConsumption: "1,850,000",
        bytecode: "0x0061736d0100000001...",
        bytecodeSize: "8.2 KB",
        abi: {},
        functions: []
      } : null
    }
    
    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error in contract API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
