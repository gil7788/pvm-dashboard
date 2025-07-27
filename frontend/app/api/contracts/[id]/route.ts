import { NextResponse } from "next/server"
import type { ContractData } from "@/types/types"

// Mock data - in a real app, this would come from a database
const contractsData: { [key: string]: ContractData } = {
  "1": {
    metadata: {
      id: "1",
      name: "DeFi Swap Contract",
      solidityAddress: "0x1234567890abcdef1234567890abcdef12345678",
      solidityDeployedTime: "2024-01-15 14:30:22",
      inkAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      inkDeployedTime: "2024-01-15 14:35:18",
      network: "Passethub",
      contractType: "both",
    },
    status: "success",
    deployedTime: "2024-01-15 14:30:22",
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
  },
  "2": {
    metadata: {
      id: "2",
      name: "NFT Marketplace",
      solidityAddress: "0xabcd...efgh",
      solidityDeployedTime: "2024-01-14 09:15:45",
      inkAddress: null,
      inkDeployedTime: null,
      network: "Passethub",
      contractType: "solidity",
    },
    status: "success",
    deployedTime: "2024-01-14 09:15:45",
    solidity: {
      gasConsumption: "1,850,000",
      bytecode: "0x608060405234801561001057600080fd5b50...",
      bytecodeSize: "10.2 KB",
      abi: [
        {
          inputs: [{ name: "tokenId", type: "uint256" }],
          name: "mint",
          outputs: [{ name: "", type: "bool" }],
          type: "function",
        },
      ],
      functions: [
        { name: "mint", gasUsed: "55,000", runtime: "15ms", lastTested: "2024-01-14" },
        { name: "transfer", gasUsed: "35,000", runtime: "10ms", lastTested: "2024-01-14" },
      ],
    },
  },
  "3": {
    metadata: {
      id: "3",
      name: "Governance Token",
      solidityAddress: null,
      solidityDeployedTime: null,
      inkAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      inkDeployedTime: "2024-01-13 16:45:12",
      network: "Passethub",
      contractType: "ink",
    },
    status: "success",
    deployedTime: "2024-01-13 16:45:12",
    ink: {
      gasConsumption: "1,200,000",
      bytecode: "0x0061736d0100000001...",
      bytecodeSize: "6.8 KB",
      abi: {
        spec: {
          constructors: [],
          messages: [
            {
              args: [{ name: "to", type: { displayName: ["AccountId"], type: 0 } }],
              name: "transfer",
              returnType: { displayName: ["bool"], type: 1 },
            },
          ],
        },
      },
      functions: [
        { name: "transfer", gasUsed: "28,000", runtime: "7ms", lastTested: "2024-01-13" },
        { name: "balance_of", gasUsed: "15,000", runtime: "4ms", lastTested: "2024-01-13" },
      ],
    },
  },
  "4": {
    metadata: {
      id: "4",
      name: "Staking Pool",
      solidityAddress: "0xdef0...1234",
      solidityDeployedTime: "2024-01-12 11:20:33",
      inkAddress: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
      inkDeployedTime: "2024-01-12 11:25:45",
      network: "Passethub",
      contractType: "both",
    },
    status: "success",
    deployedTime: "2024-01-12 11:20:33",
    solidity: {
      gasConsumption: "3,200,000",
      bytecode: "0x608060405234801561001057600080fd5b50...",
      bytecodeSize: "15.8 KB",
      abi: [
        {
          inputs: [{ name: "amount", type: "uint256" }],
          name: "stake",
          outputs: [{ name: "", type: "bool" }],
          type: "function",
        },
      ],
      functions: [
        { name: "stake", gasUsed: "75,000", runtime: "22ms", lastTested: "2024-01-12" },
        { name: "unstake", gasUsed: "65,000", runtime: "18ms", lastTested: "2024-01-12" },
      ],
    },
    ink: {
      gasConsumption: "2,100,000",
      bytecode: "0x0061736d0100000001...",
      bytecodeSize: "11.2 KB",
      abi: {
        spec: {
          constructors: [],
          messages: [
            {
              args: [{ name: "amount", type: { displayName: ["u128"], type: 0 } }],
              name: "stake",
              returnType: { displayName: ["bool"], type: 1 },
            },
          ],
        },
      },
      functions: [
        { name: "stake", gasUsed: "52,000", runtime: "14ms", lastTested: "2024-01-12" },
        { name: "unstake", gasUsed: "48,000", runtime: "12ms", lastTested: "2024-01-12" },
      ],
    },
  },
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const contractData = contractsData[params.id]

  if (!contractData) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 })
  }

  return NextResponse.json(contractData)
}
