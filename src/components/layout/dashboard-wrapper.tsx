'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/shared/navigation/navbar'
import { BackgroundVideo } from '@/components/layout/background-video'

interface DashboardWrapperProps {
  children: React.ReactNode
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const pathname = usePathname()
  const isWorkspaceRoute = pathname.includes('/workspace/')

  if (isWorkspaceRoute) {
    return <>{children}</>
  }

  return (
    <>
      <BackgroundVideo />
      <Navbar />
      <main className="relative z-20">
        {children}
      </main>
    </>
  )
}
