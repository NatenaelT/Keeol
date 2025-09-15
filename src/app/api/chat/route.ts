import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Placeholder for chat history
  const chatHistory = [
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'text',
    }
  ]
  
  return NextResponse.json(chatHistory)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Placeholder for sending chat message
  return NextResponse.json({ 
    message: 'Message sent',
    data: body 
  })
}
