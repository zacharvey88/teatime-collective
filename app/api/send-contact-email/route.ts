import { NextRequest, NextResponse } from 'next/server'
import { EmailService, ContactEmailData } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()
    
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Prepare email data
    const emailData: ContactEmailData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim()
    }

    // Send email
    await EmailService.sendContactEmail(emailData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending contact email:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
