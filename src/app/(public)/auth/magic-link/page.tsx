import { Suspense } from 'react'
import { MagicLinkHandler } from '@/components/features/auth'
import { LoadingState } from '@/components/shared/states'

export default function MagicLink() {
  return (
    <Suspense fallback={<LoadingState variant="fullPage" text="Verificando..." />}>
      <MagicLinkHandler />
    </Suspense>
  )
}
