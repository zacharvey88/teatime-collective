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
    const order = await OrderService.getOrderById(orderId)
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Prepare email data
    const emailData: OrderEmailData = {
      orderId: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      collectionDate: order.collection_date,
      allergies: order.allergies || '',
      specialRequests: order.special_requests || '',
      items: order.items.map(item => ({
        name: item.item_name,
        size: item.custom_cake_size || 'Standard',
        details: item.custom_cake_description || undefined,
        quantity: item.quantity,
        price: item.estimated_unit_price,
        writingOnCake: item.writing_on_cake || ''
      })),
      totalPrice: order.estimated_total,
      orderDate: new Date(order.created_at).toLocaleDateString('en-GB')
    }

    // Send emails - TEMPORARILY DISABLED
    // await Promise.all([
    //   EmailService.sendOrderConfirmation(emailData),
    //   EmailService.sendOrderNotification(emailData)
    // ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending order notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
} 