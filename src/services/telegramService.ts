// Telegram Bot Service for notifications and user interactions

interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat: {
    id: number
    type: string
    title?: string
    username?: string
    first_name?: string
    last_name?: string
  }
  date: number
  text?: string
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: any
}

class TelegramBotService {
  private readonly botToken: string
  private readonly baseURL: string
  private readonly webhookURL: string

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || ''
    this.baseURL = `https://api.telegram.org/bot${this.botToken}`
    this.webhookURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`
    
    if (!this.botToken) {
      console.warn('Telegram bot token not configured')
    }
  }

  /**
   * Send a text message to a user or group
   */
  async sendMessage(
    chatId: string | number,
    text: string,
    options: {
      parse_mode?: 'HTML' | 'Markdown'
      disable_web_page_preview?: boolean
      disable_notification?: boolean
      reply_markup?: any
    } = {}
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          ...options
        })
      })

      const result = await response.json()
      return result.ok
    } catch (error) {
      console.error('Failed to send Telegram message:', error)
      return false
    }
  }

  /**
   * Send order confirmation notification
   */
  async sendOrderConfirmation(
    chatId: string | number,
    orderData: {
      orderNumber: string
      items: Array<{ name: string; quantity: number; price: number }>
      total: number
      estimatedTime: number
      customerName: string
    }
  ): Promise<boolean> {
    const itemsList = orderData.items
      .map(item => `• ${item.quantity}x ${item.name} - ${item.price * item.quantity} ETB`)
      .join('\n')

    const message = `
🍔 <b>Order Confirmed!</b>

<b>Order #${orderData.orderNumber}</b>
Customer: ${orderData.customerName}

<b>Items:</b>
${itemsList}

<b>Total: ${orderData.total} ETB</b>
<b>Estimated Time: ${orderData.estimatedTime} minutes</b>

Thank you for choosing keol! 🍕
    `.trim()

    return this.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📱 Track Order',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/track?order=${orderData.orderNumber}`
            }
          ],
          [
            {
              text: '🍔 Order Again',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/menu`
            }
          ]
        ]
      }
    })
  }

  /**
   * Send order status update
   */
  async sendOrderStatusUpdate(
    chatId: string | number,
    orderNumber: string,
    status: string,
    message: string
  ): Promise<boolean> {
    const statusEmojis = {
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '��',
      out_for_delivery: '🚚',
      delivered: '✅',
      cancelled: '❌'
    }

    const emoji = statusEmojis[status as keyof typeof statusEmojis] || '📱'
    
    const text = `
${emoji} <b>Order Update</b>

<b>Order #${orderNumber}</b>
Status: <b>${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</b>

${message}
    `.trim()

    return this.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📱 Track Order',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/track?order=${orderNumber}`
            }
          ]
        ]
      }
    })
  }

  /**
   * Send promotional message
   */
  async sendPromotion(
    chatId: string | number,
    promotion: {
      title: string
      description: string
      discount?: string
      validUntil?: string
      imageUrl?: string
    }
  ): Promise<boolean> {
    let message = `
🎉 <b>${promotion.title}</b>

${promotion.description}
    `

    if (promotion.discount) {
      message += `\n💰 <b>Discount: ${promotion.discount}</b>`
    }

    if (promotion.validUntil) {
      message += `\n⏰ Valid until: ${promotion.validUntil}`
    }

    message += '\n\n🍔 Order now and enjoy!'

    return this.sendMessage(chatId, message.trim(), {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🛒 Order Now',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/menu`
            }
          ]
        ]
      }
    })
  }

  /**
   * Send delivery update with location
   */
  async sendDeliveryUpdate(
    chatId: string | number,
    orderNumber: string,
    driverName: string,
    estimatedTime: number,
    driverPhone?: string
  ): Promise<boolean> {
    const message = `
🚚 <b>Your order is on the way!</b>

<b>Order #${orderNumber}</b>
Driver: ${driverName}
Estimated arrival: ${estimatedTime} minutes

Your delicious food will be with you soon! 🍔🍕
    `.trim()

    const keyboard = [
      [
        {
          text: '📱 Track Order',
          url: `${process.env.NEXT_PUBLIC_APP_URL}/track?order=${orderNumber}`
        }
      ]
    ]

    if (driverPhone) {
      keyboard.push([
        {
          text: '📞 Call Driver',
          url: `tel:${driverPhone}`
        }
      ])
    }

    return this.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: keyboard
      }
    })
  }

  /**
   * Process incoming webhook updates
   */
  async processUpdate(update: TelegramUpdate): Promise<void> {
    try {
      if (update.message) {
        await this.handleMessage(update.message)
      }
      
      if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query)
      }
    } catch (error) {
      console.error('Error processing Telegram update:', error)
    }
  }

  /**
   * Handle incoming messages
   */
  private async handleMessage(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id
    const text = message.text?.toLowerCase() || ''
    const userName = message.from?.first_name || 'there'

    // Handle commands
    if (text.startsWith('/start')) {
      await this.sendWelcomeMessage(chatId, userName)
    } else if (text.startsWith('/menu')) {
      await this.sendMenuLink(chatId)
    } else if (text.startsWith('/track')) {
      await this.sendTrackingInstructions(chatId)
    } else if (text.startsWith('/help')) {
      await this.sendHelpMessage(chatId)
    } else {
      // Forward to customer support
      await this.forwardToSupport(message)
    }
  }

  /**
   * Send welcome message
   */
  private async sendWelcomeMessage(chatId: number, userName: string): Promise<void> {
    const message = `
👋 Welcome to keol, ${userName}!

🍔 We serve the best burgers and pizzas in Addis Ababa!

What would you like to do?
    `.trim()

    await this.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🍔 View Menu',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/menu`
            },
            {
              text: '📱 Order Now',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/menu`
            }
          ],
          [
            {
              text: '📍 Our Locations',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/contact`
            },
            {
              text: '📞 Contact Us',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/contact`
            }
          ]
        ]
      }
    })
  }

  /**
   * Send menu link
   */
  private async sendMenuLink(chatId: number): Promise<void> {
    const message = `
🍔 <b>Our Delicious Menu</b>

Check out our mouth-watering burgers, pizzas, and more!

🍕 Fresh ingredients
🚚 Fast delivery
💰 Great prices
    `.trim()

    await this.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🍔 View Full Menu',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/menu`
            }
          ]
        ]
      }
    })
  }

  /**
   * Send tracking instructions
   */
  private async sendTrackingInstructions(chatId: number): Promise<void> {
    const message = `
📦 <b>Track Your Order</b>

To track your order:
1️⃣ Click the button below
2️⃣ Enter your order number
3️⃣ Get real-time updates

Need help? Just reply to this message!
    `.trim()

    await this.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📱 Track Order',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/track`
            }
          ]
        ]
      }
    })
  }

  /**
   * Send help message
   */
  private async sendHelpMessage(chatId: number): Promise<void> {
    const message = `
🆘 <b>How can we help?</b>

<b>Available commands:</b>
/menu - View our menu
/track - Track your order
/help - Show this help message

<b>Quick actions:</b>
• Order food: Just click "Order Now"
• Track order: Use your order number
• Contact support: Reply to any message

We're here to help! 😊
    `.trim()

    await this.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🍔 Order Now',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/menu`
            },
            {
              text: '📱 Track Order',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/track`
            }
          ]
        ]
      }
    })
  }

  /**
   * Forward message to customer support
   */
  private async forwardToSupport(message: TelegramMessage): Promise<void> {
    // In a real implementation, this would forward to support staff
    const supportMessage = `
📨 <b>New Customer Message</b>

From: ${message.from?.first_name || 'Customer'} (@${message.from?.username || 'N/A'})
Chat ID: ${message.chat.id}
Message: "${message.text}"

Time: ${new Date(message.date * 1000).toLocaleString()}
    `.trim()

    // Send to support group/channel (configure SUPPORT_CHAT_ID)
    const supportChatId = process.env.TELEGRAM_SUPPORT_CHAT_ID
    if (supportChatId) {
      await this.sendMessage(supportChatId, supportMessage, { parse_mode: 'HTML' })
    }

    // Auto-reply to customer
    await this.sendMessage(message.chat.id, `
Thank you for your message! 💬

Our customer support team will get back to you soon.

In the meantime, you can:
🍔 Browse our menu
📱 Track your order
📞 Call us directly

We appreciate your patience!
    `.trim(), {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🍔 View Menu',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/menu`
            },
            {
              text: '📞 Call Us',
              url: 'tel:+251911123456'
            }
          ]
        ]
      }
    })
  }

  /**
   * Handle callback queries (button presses)
   */
  private async handleCallbackQuery(callbackQuery: any): Promise<void> {
    // Handle inline button presses
    // Implementation depends on specific callback data structure
  }

  /**
   * Set webhook for receiving updates
   */
  async setWebhook(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: this.webhookURL,
          allowed_updates: ['message', 'callback_query']
        })
      })

      const result = await response.json()
      return result.ok
    } catch (error) {
      console.error('Failed to set Telegram webhook:', error)
      return false
    }
  }

  /**
   * Get bot information
   */
  async getBotInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/getMe`)
      const result = await response.json()
      return result.result
    } catch (error) {
      console.error('Failed to get bot info:', error)
      return null
    }
  }

  /**
   * Broadcast message to multiple users
   */
  async broadcastMessage(
    chatIds: (string | number)[],
    message: string,
    options: any = {}
  ): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const chatId of chatIds) {
      const sent = await this.sendMessage(chatId, message, options)
      if (sent) {
        success++
      } else {
        failed++
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return { success, failed }
  }
}

export const telegramService = new TelegramBotService()
export default telegramService
