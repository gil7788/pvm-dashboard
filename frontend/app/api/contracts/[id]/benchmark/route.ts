import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/contracts/${params.id}/benchmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to run benchmark' }, { status: response.status })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in benchmark API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 