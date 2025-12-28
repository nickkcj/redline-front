import { Suspense } from 'react'
import { OAuthCallback } from '@/components/features/auth'
import { LoadingState } from '@/components/shared/states'

export default function AuthSuccess() {
  return (
    <Suspense fallback={<LoadingState variant="fullPage" text="Autenticando..." />}>
      <OAuthCallback />
    </Suspense>
  )
}
