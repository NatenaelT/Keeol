import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      first_name: string
      last_name?: string
      username?: string
    }
    chat: {
      id: number
      type: string
    }
    text?: string
    date: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()

    // Verify the request is from Telegram (basic security)
    const telegramToken = request.headers.get('x-telegram-bot-api-secret-token')
    
    if (!update.message) {
      return NextResponse.json({ ok: true })
    }

    const { message } = update
    const chatId = message.chat.id
    const userId = message.from.id
    const text = message.text || ''

    // Handle different commands
    if (text.startsWith('/start')) {
      await sendTelegramMessage(chatId, 
        '🍔 Welcome to Keeol Burger & Pizza House!\n\n' +
        'I can help you:\n' +
        '• Browse our delicious menu\n' +
        '• Place orders\n' +
        '• Track your orders\n' +
        '• Get updates on special offers\n\n' +
        'Send /menu to see our offerings or /help for more commands!'
      )
    } else if (text.startsWith('/menu')) {
      await sendTelegramMessage(chatId,
        '🍕 Our Popular Items:\n\n' +
        '🍔 Keeol Special Burger - 450 ETB\n' +
        '🍕 Margherita Pizza - 380 ETB\n' +
        '🍗 Chicken Deluxe - 420 ETB\n\n' +
        'Visit our website to see the full menu and place orders:\n' +
        `${process.env.NEXT_PUBLIC_APP_URL}/menu`
      )
    } else if (text.startsWith('/help')) {
      await sendTelegramMessage(chatId,
        '🤖 Available Commands:\n\n' +
        '/start - Welcome message\n' +
        '/menu - View popular items\n' +
        '/orders - Check your orders\n' +
        '/contact - Contact information\n' +
        '/help - Show this help\n\n' +
        'You can also visit our website:\n' +
        process.env.NEXT_PUBLIC_APP_URL
      )
    } else if (text.startsWith('/orders')) {
      // Check if user exists in our system
      const user = await authService.findUserByTelegramId(userId)
      if (user) {
        await sendTelegramMessage(chatId,
          `📋 Your orders:\n\n` +
          `Visit ${process.env.NEXT_PUBLIC_APP_URL}/orders to view your order history.`
        )
      } else {
        await sendTelegramMessage(chatId,
          'You need to create an account first! Visit our website to sign up:\n' +
          process.env.NEXT_PUBLIC_APP_URL
        )
      }
    } else if (text.startsWith('/contact')) {
      await sendTelegramMessage(chatId,
        '📞 Contact Us:\n\n' +
        'Phone: +251-911-123456\n' +
        'Location: Bole, Addis Ababa\n' +
        'Website: ' + process.env.NEXT_PUBLIC_APP_URL + '\n\n' +
        'We\'re here to serve you delicious food! 🍔🍕'
      )
    } else {
      // Default response for unknown messages
      await sendTelegramMessage(chatId,
        'Hi there! 👋\n\n' +
        'I\'m the Keeol Burger bot. Send /help to see what I can do for you!'
      )
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text())
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error)
  }
}

// Handle GET request for webhook verification
export async function GET() {
  return NextResponse.json({ 
    status: 'Telegram webhook is running',
    timestamp: new Date().toISOString()
  })
}
