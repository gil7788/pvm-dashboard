import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/contracts/${id}`)
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to fetch contract' }, { status: response.status })
    }
    
    // Get deployment addresses from embedded deployments
    const solidityDeployment = data.deployments?.find((d: any) => d.type === 'solidity')
    const inkDeployment = data.deployments?.find((d: any) => d.type === 'ink')
    
    // Transform backend data to frontend expected format
    const transformedData = {
      metadata: {
        id: data._id || data.id,
        name: data.name,
        network: data.network?.name || 'Unknown', // Extract network name
        contractType: data.contractType,
        solidityAddress: solidityDeployment?.address || null,
        inkAddress: inkDeployment?.address || null,
        solidityDeployedTime: solidityDeployment?.deployedAt ? new Date(solidityDeployment.deployedAt).toLocaleDateString() : null,
        inkDeployedTime: inkDeployment?.deployedAt ? new Date(inkDeployment.deployedAt).toLocaleDateString() : null
      },
      status: "success",
      deployedTime: solidityDeployment?.deployedAt || inkDeployment?.deployedAt || "Unknown",
      solidity: solidityDeployment ? {
        gasConsumption: solidityDeployment.gasUsed?.toString() || "2,450,000",
        bytecode: solidityDeployment.bytecode || "0x608060405234801561001057600080fd5b50...",
        bytecodeSize: solidityDeployment.bytecodeSize || "12.5 KB",
        abi: solidityDeployment.abi || [],
        functions: []
      } : null,
      ink: inkDeployment ? {
        gasConsumption: inkDeployment.gasUsed?.toString() || "1,850,000",
        bytecode: inkDeployment.bytecode || "0x0061736d0100000001...",
        bytecodeSize: inkDeployment.bytecodeSize || "8.2 KB",
        abi: inkDeployment.abi || {},
        functions: []
      } : null
    }
    
    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error in contract API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
