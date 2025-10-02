'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function GenerateTestDataButton() {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const handleGenerate = async () => {
    if (!confirm('Generate 20 random events (10 past, 10 future)?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/events/generate-test-data', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate test data')
      }

      const data = await response.json()
      alert(`✅ Successfully generated ${data.count} test events!`)

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['events'] })
    } catch (error) {
      console.error('Error generating test data:', error)
      alert('❌ Failed to generate test data. See console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={isLoading}
      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Development only: Generate 20 random test events"
    >
      {isLoading ? '⏳ Generating...' : '🧪 Test Data'}
    </button>
  )
}
