'use client'

import { track } from '@vercel/analytics'
import { GradientButton } from './gradient-button'

interface HomeCreateButtonProps {
  href: string
  className?: string
}

export function HomeCreateButton({ href, className }: HomeCreateButtonProps) {
  return (
    <GradientButton
      href={href}
      onClick={() => track('create_event_home_click')}
      className={className}
    >
      🚀 Start Creating
    </GradientButton>
  )
}
