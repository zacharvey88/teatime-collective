import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/orderService'
import { EmailService, OrderEmailData } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting order notification process...')
    const { orderId } = await request.json()
    
    if (!orderId) {
      console.error('No order ID provided')
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching order with ID:', orderId)
    // Get the order details
    const orderRequest = await OrderService.getOrderRequestById(orderId)
    console.log('Order request data:', orderRequest)
    
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
    
    console.log('Email data prepared:', emailData)

    console.log('Sending emails...')
    // Send emails
    await Promise.all([
      EmailService.sendOrderConfirmation(emailData),
      EmailService.sendOrderNotification(emailData)
    ])

    console.log('Order emails sent successfully for order:', orderRequest.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending order notification:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to send notification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 