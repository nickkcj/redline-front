import { Suspense } from 'react'
import { LoginPage as LoginPageComponent } from '@/components/features/auth'
import { LoadingState } from '@/components/shared/states'

export default function Login() {
  return (
    <Suspense fallback={<LoadingState variant="fullPage" text="Carregando..." />}>
      <LoginPageComponent />
    </Suspense>
  )
}
