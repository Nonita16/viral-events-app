import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// POST /api/invites - Send invite to email
export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { event_id, sent_to_email, referral_code } = body

  if (!event_id || !sent_to_email) {
    return NextResponse.json(
      { error: 'event_id and sent_to_email are required' },
      { status: 400 }
    )
  }

  // Get event details for the email
  const { data: event } = await supabase
    .from('events')
    .select('title, event_date, event_time, location')
    .eq('id', event_id)
    .single()

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  // Create invite record in database
  const { data: invite, error } = await supabase
    .from('invites')
    .insert({
      event_id,
      sent_by: user.id,
      sent_to_email,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send email via Resend (optional, only if configured)
  if (resend) {
    try {
      const inviteLink = referral_code
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?ref=${referral_code}`
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${event_id}`

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: sent_to_email,
        subject: `You're invited to ${event.title}`,
        html: `
          <h1>You're invited to ${event.title}!</h1>
          <p><strong>Date:</strong> ${new Date(event.event_date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}${event.event_time ? ` at ${event.event_time}` : ''}</p>
          ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
          <p><a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #ec4899, #eab308); color: white; text-decoration: none; border-radius: 9999px; font-weight: bold;">View Event & RSVP</a></p>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // Don't fail the request if email fails, invite is already created
    }
  }

  return NextResponse.json({ invite }, { status: 201 })
}
