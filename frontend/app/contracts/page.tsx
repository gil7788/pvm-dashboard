import { ContractsClient } from "./contracts-client"
import type { ContractMetadata } from "@/types/types"
import { NEXT_PUBLIC_BACKEND_URL } from "@/lib/env"

async function getContracts(): Promise<ContractMetadata[]> {
  const baseUrl = NEXT_PUBLIC_BACKEND_URL

  try {
    const res = await fetch(`${baseUrl}/api/contracts`, {
      cache: "no-store", // Ensure fresh data on each request
    })

    if (!res.ok) {
      throw new Error("Failed to fetch contracts")
    }

    const contracts = await res.json()
    
    // Transform backend data to frontend expected format
    return contracts.map((contract: any) => {
      const solidityDeployment = contract.deployments?.find((d: any) => d.type === 'solidity')
      const inkDeployment = contract.deployments?.find((d: any) => d.type === 'ink')
      
      return {
        id: contract._id || contract.id,
        name: contract.name,
        network: contract.network?.name || 'Unknown', // Extract network name
        contractType: contract.contractType,
        solidityAddress: solidityDeployment?.address || null,
        inkAddress: inkDeployment?.address || null,
        solidityDeployedTime: solidityDeployment?.deployedAt ? new Date(solidityDeployment.deployedAt).toLocaleDateString() : null,
        inkDeployedTime: inkDeployment?.deployedAt ? new Date(inkDeployment.deployedAt).toLocaleDateString() : null,
      }
    })
  } catch (error) {
    console.error("Error fetching contracts:", error)
    return []
  }
}

export default async function ContractsPage() {
  const contracts = await getContracts()

  return <ContractsClient contracts={contracts} />
}
