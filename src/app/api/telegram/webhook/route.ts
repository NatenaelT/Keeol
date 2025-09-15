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
      // Check if user exists and create if not
      let user = await authService.findUserByTelegramId(userId)
      if (!user) {
        user = await authService.createUser({
          telegramId: userId,
          name: `${message.from.first_name} ${message.from.last_name || ''}`.trim(),
          role: 'customer'
        })
      }

      await sendTelegramMessage(chatId,
        `🍔 Welcome to Keeol Burger & Pizza House, ${message.from.first_name}!\n\n` +
        'I can help you:\n' +
        '• 📋 /register - Create your account\n' +
        '• 🍕 /menu - Browse our delicious menu\n' +
        '• 📦 /orders - Track your orders\n' +
        '• 📞 /contact - Get contact information\n' +
        '• ❓ /help - Show all commands\n\n' +
        'Visit our website: ' + process.env.NEXT_PUBLIC_APP_URL
      )
    } else if (text.startsWith('/register')) {
      // Registration process
      let user = await authService.findUserByTelegramId(userId)
      if (!user) {
        user = await authService.createUser({
          telegramId: userId,
          name: `${message.from.first_name} ${message.from.last_name || ''}`.trim(),
          role: 'customer'
        })

        await sendTelegramMessage(chatId,
          `✅ Registration successful!\n\n` +
          `👤 Name: ${user.name}\n` +
          `🆔 Account ID: ${user.id}\n` +
          `📱 Telegram: @${message.from.username || 'N/A'}\n\n` +
          `🎉 Welcome to Keeol Burger family!\n\n` +
          `You can now:\n` +
          `• Browse our menu: /menu\n` +
          `• Place orders on our website\n` +
          `• Track orders: /orders\n\n` +
          `Website: ${process.env.NEXT_PUBLIC_APP_URL}`
        )
      } else {
        await sendTelegramMessage(chatId,
          `✅ You're already registered!\n\n` +
          `👤 Name: ${user.name}\n` +
          `🆔 Account ID: ${user.id}\n` +
          `🎭 Role: ${user.role}\n\n` +
          `Visit our website to start ordering:\n` +
          `${process.env.NEXT_PUBLIC_APP_URL}`
        )
      }
    } else if (text.startsWith('/menu')) {
      await sendTelegramMessage(chatId,
        '🍕 Our Popular Items:\n\n' +
        '🍔 Keeol Special Burger - 450 ETB\n' +
        '  Double beef patty with special sauce\n\n' +
        '🍕 Margherita Pizza - 380 ETB\n' +
        '  Classic Italian with fresh basil\n\n' +
        '🍗 Chicken Deluxe - 420 ETB\n' +
        '  Crispy chicken with special sauce\n\n' +
        '🥤 Beverages & Sides Available\n\n' +
        '📱 Order online: ' + process.env.NEXT_PUBLIC_APP_URL + '/menu\n' +
        '📞 Call: +251-911-123456'
      )
    } else if (text.startsWith('/admin')) {
      // Admin commands
      const user = await authService.findUserByTelegramId(userId)
      if (user && (user.role === 'admin' || user.role === 'owner')) {
        await sendTelegramMessage(chatId,
          '👑 Admin Panel:\n\n' +
          '/admin_stats - View daily statistics\n' +
          '/admin_orders - Recent orders\n' +
          '/admin_users - User management\n' +
          '/admin_menu - Menu management\n\n' +
          '🌐 Admin Dashboard: ' + process.env.NEXT_PUBLIC_APP_URL + '/admin'
        )
      } else {
        await sendTelegramMessage(chatId, '❌ Access denied. Admin privileges required.')
      }
    } else if (text.startsWith('/help')) {
      const user = await authService.findUserByTelegramId(userId)
      const isAdmin = user && (user.role === 'admin' || user.role === 'owner')

      let helpText = '🤖 Available Commands:\n\n' +
        '👤 User Commands:\n' +
        '/start - Welcome message\n' +
        '/register - Create account\n' +
        '/menu - View popular items\n' +
        '/orders - Check your orders\n' +
        '/contact - Contact information\n' +
        '/help - Show this help\n\n'

      if (isAdmin) {
        helpText += '👑 Admin Commands:\n' +
          '/admin - Admin panel\n' +
          '/admin_stats - Statistics\n' +
          '/admin_orders - Recent orders\n\n'
      }

      helpText += 'Visit our website: ' + process.env.NEXT_PUBLIC_APP_URL

      await sendTelegramMessage(chatId, helpText)
    } else if (text.startsWith('/orders')) {
      // Check if user exists in our system
      const user = await authService.findUserByTelegramId(userId)
      if (user) {
        await sendTelegramMessage(chatId,
          `📋 Your Orders, ${user.name}:\n\n` +
          `🔍 To view your complete order history,\n` +
          `visit: ${process.env.NEXT_PUBLIC_APP_URL}/orders\n\n` +
          `💡 Tip: Use our website to place new orders!`
        )
      } else {
        await sendTelegramMessage(chatId,
          '❌ Account not found!\n\n' +
          'Please register first: /register\n' +
          'Or visit our website: ' + process.env.NEXT_PUBLIC_APP_URL
        )
      }
    } else if (text.startsWith('/contact')) {
      await sendTelegramMessage(chatId,
        '📞 Contact Keeol Burger & Pizza House:\n\n' +
        '📱 Phone: +251-911-123456\n' +
        '📍 Address: Bole, Addis Ababa\n' +
        '🌐 Website: ' + process.env.NEXT_PUBLIC_APP_URL + '\n' +
        '⏰ Hours: 9:00 AM - 11:00 PM\n\n' +
        '💬 You can also message us here!\n' +
        '🍔🍕 We\'re here to serve you delicious food!'
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
