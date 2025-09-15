import { NextRequest, NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`

export async function POST(request: NextRequest) {
  try {
    // Set webhook
    const webhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message'],
        drop_pending_updates: true
      }),
    })

    const webhookData = await webhookResponse.json()

    // Get bot info
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
    const botInfo = await botInfoResponse.json()

    // Get webhook info
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`)
    const webhookInfo = await webhookInfoResponse.json()

    return NextResponse.json({
      success: true,
      webhook: webhookData,
      bot: botInfo,
      webhookInfo: webhookInfo.result,
      webhookUrl: WEBHOOK_URL
    })

  } catch (error) {
    console.error('Webhook setup error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get current webhook info
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`)
    const webhookInfo = await webhookInfoResponse.json()

    // Get bot info
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
    const botInfo = await botInfoResponse.json()

    return NextResponse.json({
      bot: botInfo.result,
      webhook: webhookInfo.result,
      expectedWebhookUrl: WEBHOOK_URL
    })

  } catch (error) {
    console.error('Webhook info error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
