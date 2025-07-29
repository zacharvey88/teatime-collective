import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/orderService'

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
    
    // For now, just log the notification
    // In a real implementation, you would integrate with an email service
    console.log('Order notification for:', {
      orderId: orderRequest.id,
      customerName: orderRequest.customer_name,
      customerEmail: orderRequest.customer_email,
      total: orderRequest.estimated_total,
      items: orderRequest.items.length
    })

    // Example email service integration:
    // await sendEmail({
    //   to: 'orders@teatimecollective.co.uk',
    //   subject: `New Order Request - ${orderRequest.customer_name}`,
    //   body: `New order received from ${orderRequest.customer_name} for £${orderRequest.estimated_total}`
    // })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending order notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
} 