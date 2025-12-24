import { Suspense } from 'react'
import { LoginContent } from './login-content'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex items-center justify-center bg-[#FCFCFD]">
          <Loader2 size={40} className="text-[#5C6570] animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
