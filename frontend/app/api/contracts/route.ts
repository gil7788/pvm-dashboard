import { NextResponse } from "next/server"
import type { ContractMetadata } from "@/types/types"

// Mock data - in a real app, this would come from a database
const contracts: ContractMetadata[] = [
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

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  return NextResponse.json(contracts)
}
