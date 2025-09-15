import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/orderService'
import { EmailService, OrderEmailData } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    console.log('Order notification API called with orderId:', orderId)
    console.log('Environment check:')
    console.log('- MAILERSEND_API_KEY exists:', !!process.env.MAILERSEND_API_KEY)
    console.log('- MAILERSEND_FROM_EMAIL:', process.env.MAILERSEND_FROM_EMAIL)
    
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
        console.log('Processing item:', {
          item_name: item.item_name,
          is_custom_cake: item.is_custom_cake,
          cake_id: item.cake_id,
          cake_size_id: item.cake_size_id,
          custom_cake_size: item.custom_cake_size
        })
        
        let sizeName = item.custom_cake_size || 'Standard'
        let cakeName = item.item_name
        
        // If it's not a custom cake, get the actual size and variant info
        if (!item.is_custom_cake && item.cake_id && item.cake_size_id) {
          try {
            console.log('Looking up cake details for:', { cake_id: item.cake_id, cake_size_id: item.cake_size_id })
            
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
            
            console.log('Cake lookup result:', { cake, cakeError })
            
            // Get size details
            const { data: cakeSize, error: sizeError } = await supabase
              .from('cake_sizes')
              .select('name')
              .eq('id', item.cake_size_id)
              .single()
            
            console.log('Size lookup result:', { cakeSize, sizeError })
            
            if (cake && cakeSize) {
              // Append category name to cake name if it exists
              const categoryName = Array.isArray(cake.cake_categories) 
                ? cake.cake_categories[0]?.name 
                : cake.cake_categories?.name
              cakeName = categoryName ? `${cake.name} - ${categoryName}` : cake.name
              sizeName = cakeSize.name
              console.log('Updated cake name:', cakeName, 'size:', sizeName)
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
    console.log('Attempting to send emails...')
    console.log('Email data:', JSON.stringify(emailData, null, 2))
    
    await Promise.all([
      EmailService.sendOrderConfirmation(emailData),
      EmailService.sendOrderNotification(emailData)
    ])
    
    console.log('Emails sent successfully')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending order notification:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 