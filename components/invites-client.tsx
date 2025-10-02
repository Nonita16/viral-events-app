'use client'

import { useState } from 'react'
import { track } from '@vercel/analytics'
import { GradientButton } from '@/components/gradient-button'

interface InvitesClientProps {
  referralCode: string | null
  analytics: {
    totalClicks: number
    totalSignups: number
    totalConversion: number
  }
}

export function InvitesClient({ referralCode, analytics }: InvitesClientProps) {
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [code, setCode] = useState(referralCode)

  const handleGenerateCode = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const data = await res.json()
        setCode(data.referralCode.code)
        track('referral_code_generated')
        window.location.reload() // Refresh to show analytics
      }
    } catch {
      // Error generating code
    } finally {
      setIsGenerating(false)
    }
  }

  if (!code) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Generate Your Referral Code
        </h2>
        <p className="text-gray-600 mb-6">
          Get your unique referral code to start inviting friends and growing your network.
        </p>
        <GradientButton onClick={handleGenerateCode} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : '✨ Generate My Referral Code'}
        </GradientButton>
      </div>
    )
  }

  const handleCopyLink = () => {
    track('referral_link_copied')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const link = `${baseUrl}/?ref=${code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInviteViaEmail = () => {
    track('referral_email_invite_sent')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const link = `${baseUrl}/?ref=${code}`
    const subject = 'Join me on My Viral Event!'
    const body = `Hey! Check out this awesome event platform I'm using. Join with my referral link: ${link}`

    // Open native email client
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <>
      {/* Referral Link Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Your Referral Link
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-lg px-6 py-2 flex items-center h-12">
            <code className="text-2xl font-bold text-pink-600">
              {code}
            </code>
          </div>
          <GradientButton
            onClick={handleCopyLink}
            className="whitespace-nowrap h-12"
          >
            📋 {copied ? 'Copied!' : 'Copy Referral Link'}
          </GradientButton>
        </div>

        <p className="text-gray-600">
          Share this link with friends. When they sign up and RSVP to events, you&apos;ll get credit for the referrals and help your events go viral! 🚀
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Clicks */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="text-sm font-medium text-gray-500 uppercase mb-2">
            Clicks
          </div>
          <div className="text-4xl font-bold text-pink-600">
            {analytics.totalClicks}
          </div>
        </div>

        {/* Signups */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="text-sm font-medium text-gray-500 uppercase mb-2">
            Signups
          </div>
          <div className="text-4xl font-bold text-yellow-600">
            {analytics.totalSignups}
          </div>
        </div>

        {/* Conversion */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="text-sm font-medium text-gray-500 uppercase mb-2">
            Conversion
          </div>
          <div className="text-4xl font-bold text-purple-600">
            {analytics.totalConversion ? `${analytics.totalConversion.toFixed(0)}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Email Invite Button */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Invite Friends via Email
        </h2>

        <p className="text-gray-600 mb-4">
          Click the button below to open your email client with a pre-filled invitation message.
        </p>

        <GradientButton
          onClick={handleInviteViaEmail}
          className="w-full sm:w-auto"
        >
          📧 Send Invite via Email
        </GradientButton>
      </div>
    </>
  )
}
