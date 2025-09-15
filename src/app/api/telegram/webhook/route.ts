import { NextRequest, NextResponse } from 'next/server'
import { telegramService } from '@/services/telegramService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify the request is from Telegram (optional but recommended)
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET
    if (secretToken) {
      const providedToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
      if (providedToken !== secretToken) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Process the update
    await telegramService.processUpdate(body)
    
    return NextResponse.json({ ok: true })
    
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  try {
    const botInfo = await telegramService.getBotInfo()
    
    if (botInfo) {
      return NextResponse.json({
        status: 'active',
        bot: {
          username: botInfo.username,
          first_name: botInfo.first_name,
          can_join_groups: botInfo.can_join_groups,
          can_read_all_group_messages: botInfo.can_read_all_group_messages,
          supports_inline_queries: botInfo.supports_inline_queries
        }
      })
    } else {
      return NextResponse.json(
        { status: 'inactive', error: 'Bot not configured' },
        { status: 503 }
      )
    }
    
  } catch (error) {
    console.error('Telegram bot health check error:', error)
    return NextResponse.json(
      { status: 'error', error: 'Failed to check bot status' },
      { status: 500 }
    )
  }
}
