import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/orderService'
import { EmailService, OrderEmailData } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get the order details
    const orderRequest = await OrderService.getOrderRequestById(orderId)
    
    // Prepare email data
    const emailData: OrderEmailData = {
      orderId: orderRequest.id,
      customerName: orderRequest.customer_name,
      customerEmail: orderRequest.customer_email,
      customerPhone: orderRequest.customer_phone,
      deliveryDate: orderRequest.collection_date,
      allergies: orderRequest.allergies || '',
      writingOnCake: orderRequest.writing_on_cake || '',
      specialRequests: orderRequest.special_requests || '',
      items: orderRequest.items.map(item => ({
        name: item.item_name,
        size: 'Standard', // This could be extracted from item_name or stored separately
        quantity: item.quantity,
        price: item.estimated_unit_price
      })),
      totalPrice: orderRequest.estimated_total,
      orderDate: new Date(orderRequest.created_at).toLocaleDateString('en-GB')
    }

    // Send emails
    await Promise.all([
      EmailService.sendOrderConfirmation(emailData),
      EmailService.sendOrderNotification(emailData)
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending order notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
} 