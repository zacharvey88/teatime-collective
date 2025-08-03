import { MailerSend, EmailParams, Sender, Recipient, Attachment } from 'mailersend'
import { SettingsService } from './settingsService'

// Initialize MailerSend client
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
})

// From email (using MailerSend test domain)
const FROM_EMAIL = 'orders@est-vz9dlem3z0p4kj50.mlsender.net'

export interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryDate: string
  allergies: string
  writingOnCake: string
  specialRequests: string
  items: Array<{
    name: string
    size: string
    quantity: number
    price: number
  }>
  totalPrice: number
  orderDate: string
}

export class EmailService {
  // Send order confirmation email to customer
  static async sendOrderConfirmation(data: OrderEmailData): Promise<void> {
    try {
      console.log('Attempting to send order confirmation email to:', data.customerEmail)
      
      const sender = new Sender(FROM_EMAIL, 'Teatime Collective')
      const recipient = new Recipient(data.customerEmail, data.customerName)

      const emailParams = new EmailParams()
        .setFrom(sender)
        .setTo([recipient])
        .setSubject(`Order Confirmation - #${data.orderId}`)
        .setHtml(await this.generateCustomerEmailHTML(data))
        .setText(await this.generateCustomerEmailText(data))

      console.log('Email params prepared, sending...')
      await mailerSend.email.send(emailParams)
      console.log(`Order confirmation email sent to ${data.customerEmail}`)
    } catch (error) {
      console.error('Failed to send order confirmation email:', error)
      throw error
    }
  }

  // Send order notification email to owner
  static async sendOrderNotification(data: OrderEmailData): Promise<void> {
    try {
      console.log('Attempting to send order notification email...')
      
      // Get the order email from settings
      const settings = await SettingsService.getSettings()
      console.log('Settings retrieved:', settings)
      
      if (!settings?.order_email) {
        throw new Error('Order email not configured in settings')
      }

      const sender = new Sender(FROM_EMAIL, 'Teatime Collective Orders')
      const recipient = new Recipient(settings.order_email, 'Teatime Collective')

      const emailParams = new EmailParams()
        .setFrom(sender)
        .setTo([recipient])
        .setSubject(`New Order Received - #${data.orderId}`)
        .setHtml(this.generateOwnerEmailHTML(data))
        .setText(this.generateOwnerEmailText(data))

      console.log('Owner email params prepared, sending...')
      await mailerSend.email.send(emailParams)
      console.log(`Order notification email sent to ${settings.order_email}`)
    } catch (error) {
      console.error('Failed to send order notification email:', error)
      throw error
    }
  }

  // Generate HTML email for customer
  private static async generateCustomerEmailHTML(data: OrderEmailData): Promise<string> {
    const itemsHTML = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name} (${item.size})</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">£${item.price.toFixed(2)}</td>
      </tr>
    `).join('')

    // Get the order email from settings
    const settings = await SettingsService.getSettings()
    const contactEmail = settings?.order_email || 'contact@teatimecollective.co.uk'

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #ddd; border-top: none; }
          .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f97316; color: white; padding: 12px; text-align: left; }
          .total { font-weight: bold; font-size: 1.2em; text-align: right; padding: 20px 0; border-top: 2px solid #f97316; }
          .highlight { color: #f97316; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍰 Order Confirmation</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="content">
            <p>Hi ${data.customerName},</p>
            
            <p>Thank you for your order with Teatime Collective! We're excited to create your delicious vegan cakes.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> <span class="highlight">#${data.orderId}</span></p>
              <p><strong>Order Date:</strong> ${data.orderDate}</p>
              <p><strong>Collection Date:</strong> ${data.deliveryDate}</p>
              ${data.allergies ? `<p><strong>Allergies:</strong> ${data.allergies}</p>` : ''}
              ${data.writingOnCake ? `<p><strong>Writing on Cake:</strong> ${data.writingOnCake}</p>` : ''}
              ${data.specialRequests ? `<p><strong>Special Requests:</strong> ${data.specialRequests}</p>` : ''}
            </div>
            
            <h3>Your Order</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            
            <div class="total">
              <strong>Total: £${data.totalPrice.toFixed(2)}</strong>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>We'll review your order and confirm the final price</li>
              <li>We'll contact you to arrange payment</li>
              <li>We'll start creating your delicious cakes!</li>
              <li>We'll let you know when your cakes are ready for collection</li>
            </ul>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            The Teatime Collective Team</p>
          </div>
          
          <div class="footer">
            <p>Teatime Collective | Vegan Cakes & Bakes</p>
            <p>Contact: ${contactEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Generate text email for customer
  private static async generateCustomerEmailText(data: OrderEmailData): Promise<string> {
    const itemsText = data.items.map(item => 
      `- ${item.name} (${item.size}) x${item.quantity} - £${item.price.toFixed(2)}`
    ).join('\n')

    // Get the order email from settings
    const settings = await SettingsService.getSettings()
    const contactEmail = settings?.order_email || 'contact@teatimecollective.co.uk'

    return `
Order Confirmation - #${data.orderId}

Hi ${data.customerName},

Thank you for your order with Teatime Collective! We're excited to create your delicious vegan cakes.

ORDER DETAILS:
Order ID: #${data.orderId}
Order Date: ${data.orderDate}
Collection Date: ${data.deliveryDate}
${data.allergies ? `Allergies: ${data.allergies}` : ''}
${data.writingOnCake ? `Writing on Cake: ${data.writingOnCake}` : ''}
${data.specialRequests ? `Special Requests: ${data.specialRequests}` : ''}

YOUR ORDER:
${itemsText}

Total: £${data.totalPrice.toFixed(2)}

What happens next?
- We'll review your order and confirm the final price
- We'll contact you to arrange payment
- We'll start creating your delicious cakes!
- We'll let you know when your cakes are ready for collection

If you have any questions, please don't hesitate to contact us.

Best regards,
The Teatime Collective Team

Teatime Collective | Vegan Cakes & Bakes
Contact: ${contactEmail}
    `.trim()
  }

  // Generate HTML email for owner
  private static generateOwnerEmailHTML(data: OrderEmailData): string {
    const itemsHTML = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name} (${item.size})</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">£${item.price.toFixed(2)}</td>
      </tr>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; }
          .customer-info { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #dc2626; color: white; padding: 12px; text-align: left; }
          .total { font-weight: bold; font-size: 1.2em; text-align: right; padding: 20px 0; border-top: 2px solid #dc2626; }
          .highlight { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🆕 New Order Received</h1>
            <p>Order #${data.orderId}</p>
          </div>
          
          <div class="content">
            <h2>Customer Information</h2>
            <div class="customer-info">
              <p><strong>Name:</strong> ${data.customerName}</p>
              <p><strong>Email:</strong> <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${data.customerPhone}">${data.customerPhone}</a></p>
              <p><strong>Collection Date:</strong> ${data.deliveryDate}</p>
              ${data.allergies ? `<p><strong>Allergies:</strong> ${data.allergies}</p>` : ''}
              ${data.writingOnCake ? `<p><strong>Writing on Cake:</strong> ${data.writingOnCake}</p>` : ''}
              ${data.specialRequests ? `<p><strong>Special Requests:</strong> ${data.specialRequests}</p>` : ''}
            </div>
            
            <h2>Order Items</h2>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            
            <div class="total">
              <strong>Total: £${data.totalPrice.toFixed(2)}</strong>
            </div>
            
            <p><strong>Order placed:</strong> ${data.orderDate}</p>
            
            <p>Please review this order and contact the customer to confirm pricing and arrange payment.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Generate text email for owner
  private static generateOwnerEmailText(data: OrderEmailData): string {
    const itemsText = data.items.map(item => 
      `- ${item.name} (${item.size}) x${item.quantity} - £${item.price.toFixed(2)}`
    ).join('\n')

    return `
New Order Received - #${data.orderId}

CUSTOMER INFORMATION:
Name: ${data.customerName}
Email: ${data.customerEmail}
Phone: ${data.customerPhone}
Collection Date: ${data.deliveryDate}
${data.allergies ? `Allergies: ${data.allergies}` : ''}
${data.writingOnCake ? `Writing on Cake: ${data.writingOnCake}` : ''}
${data.specialRequests ? `Special Requests: ${data.specialRequests}` : ''}

ORDER ITEMS:
${itemsText}

Total: £${data.totalPrice.toFixed(2)}

Order placed: ${data.orderDate}

Please review this order and contact the customer to confirm pricing and arrange payment.
    `.trim()
  }
} 