import { ContractClient } from "./contract-client"
import type { ContractData } from "@/types/types"
import { notFound } from "next/navigation"
import { getBaseUrl } from "@/lib/env"

async function getContract(id: string): Promise<ContractData | null> {
  const baseUrl = getBaseUrl()

  try {
    const res = await fetch(`${baseUrl}/api/contracts/${id}`, {
      cache: "no-store", // Ensure fresh data on each request
    })

    if (!res.ok) {
      if (res.status === 404) {
        return null
      }
      throw new Error("Failed to fetch contract")
    }

    return res.json()
  } catch (error) {
    console.error("Error fetching contract:", error)
    return null
  }
}

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contractData = await getContract(id)

  if (!contractData) {
    notFound()
  }

  return <ContractClient contractData={contractData} />
}
