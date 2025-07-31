import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/contracts/${params.id}/analytics`)
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to fetch analytics' }, { status: response.status })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in analytics API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 