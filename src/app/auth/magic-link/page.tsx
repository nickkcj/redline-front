'use client'

import { Suspense } from 'react'
import MagicLinkContent from './content'

export default function MagicLinkPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen flex items-center justify-center">Loading...</div>}>
      <MagicLinkContent />
    </Suspense>
  )
}
