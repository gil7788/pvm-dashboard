import { z } from "zod"

const envSchema = z.object({
  // Next.js built-in variables
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Custom application variables
  NEXT_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000").describe("Base URL for the application"),

  // Database (for future use)
  DATABASE_URL: z.string().optional().describe("Database connection string"),

  // API Keys (for future blockchain integration)
  POLKADOT_API_KEY: z.string().optional().describe("Polkadot API key for blockchain interactions"),

  PASSETHUB_RPC_URL: z.string().url().optional().describe("Passethub RPC endpoint URL"),
})

// Parse and validate environment variables
function parseEnv() {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      DATABASE_URL: process.env.DATABASE_URL,
      POLKADOT_API_KEY: process.env.POLKADOT_API_KEY,
      PASSETHUB_RPC_URL: process.env.PASSETHUB_RPC_URL,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment variable validation failed:")
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`)
      })

      // In development, provide helpful defaults
      if (process.env.NODE_ENV === "development") {
        console.warn("🔧 Using development defaults for missing environment variables")
        return {
          NODE_ENV: "development" as const,
          NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
          DATABASE_URL: undefined,
          POLKADOT_API_KEY: undefined,
          PASSETHUB_RPC_URL: undefined,
        }
      }

      process.exit(1)
    }
    throw error
  }
}

export const env = parseEnv()

// Helper function to get the base URL for API calls
export function getBaseUrl() {
  // In browser, use relative URLs
  if (typeof window !== "undefined") {
    return ""
  }

  // In server-side rendering, use the full URL
  return env.NEXT_PUBLIC_BASE_URL
}

// Validation helper for runtime checks
export function validateEnv() {
  const requiredInProduction = ["NEXT_PUBLIC_BASE_URL"]

  if (env.NODE_ENV === "production") {
    const missing = requiredInProduction.filter((key) => !process.env[key])

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables in production: ${missing.join(", ")}`)
    }
  }

  console.log("✅ Environment variables validated successfully")
  return true
}

// Export individual variables for convenience
export const { NODE_ENV, NEXT_PUBLIC_BASE_URL, DATABASE_URL, POLKADOT_API_KEY, PASSETHUB_RPC_URL } = env
