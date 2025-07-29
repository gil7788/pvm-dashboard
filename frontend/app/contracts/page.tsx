import { ContractsClient } from "./contracts-client"
import type { ContractMetadata } from "@/types/types"
import { getBaseUrl } from "@/lib/env"

async function getContracts(): Promise<ContractMetadata[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

  try {
    const res = await fetch(`${baseUrl}/api/contracts`, {
      cache: "no-store", // Ensure fresh data on each request
    })

    if (!res.ok) {
      throw new Error("Failed to fetch contracts")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching contracts:", error)
    return []
  }
}

export default async function ContractsPage() {
  const contracts = await getContracts()

  return <ContractsClient contracts={contracts} />
}
