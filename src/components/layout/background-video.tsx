'use client'

import { useEffect, useState } from 'react'

interface BackgroundVideoProps {
  /**
   * Opacity of the background (0 to 1)
   * Default: 0.8 (80% opaque, 20% transparent)
   */
  opacity?: number
}

export function BackgroundVideo({ opacity = 0.8 }: BackgroundVideoProps) {
  const [isMounted, setIsMounted] = useState(false)

  // Only render on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <video
        src="/mountain-vector-white.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/mountain-vector-white.mp4" type="video/mp4" />
      </video>
      {/* Overlay for opacity effect */}
      <div
        className="fixed inset-0 bg-background z-10"
        style={{ opacity: 1 - opacity }}
      />
    </>
  )
}
