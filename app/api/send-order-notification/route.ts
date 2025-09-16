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

    // Get detailed cake information for each item
    const { supabase } = await import('@/lib/supabaseClient')
    
    const itemsWithDetails = await Promise.all(
      order.items.map(async (item) => {
        let sizeName = item.custom_cake_size || 'Standard'
        let cakeName = item.item_name
        
        // If it's not a custom cake, get the actual size and variant info
        if (!item.is_custom_cake && item.cake_id && item.cake_size_id) {
          try {
            // Get cake details with category name
            const { data: cake, error: cakeError } = await supabase
              .from('cakes')
              .select(`
                name,
                category_id,
                cake_categories!inner(name)
              `)
              .eq('id', item.cake_id)
              .single()
            
            // Get size details
            const { data: cakeSize, error: sizeError } = await supabase
              .from('cake_sizes')
              .select('name')
              .eq('id', item.cake_size_id)
              .single()
            
            if (cake && cakeSize) {
              // Append category name to cake name if it exists
              const categoryName = Array.isArray(cake.cake_categories) 
                ? (cake.cake_categories as any)[0]?.name 
                : (cake.cake_categories as any)?.name
              cakeName = categoryName ? `${cake.name} - ${categoryName}` : cake.name
              sizeName = cakeSize.name
            }
          } catch (error) {
            console.error('Error fetching cake details:', error)
            // Fall back to original values
          }
        }
        
        return {
          name: cakeName,
          size: sizeName,
          details: item.custom_cake_description || undefined,
          quantity: item.quantity,
          price: item.estimated_unit_price,
          writingOnCake: item.writing_on_cake || ''
        }
      })
    )

    // Prepare email data
    const emailData: OrderEmailData = {
      orderId: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      collectionDate: order.collection_date,
      allergies: order.allergies || '',
      specialRequests: order.special_requests || '',
      items: itemsWithDetails,
      totalPrice: order.estimated_total,
      orderDate: new Date(order.created_at).toLocaleDateString('en-GB')
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
      { 
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 