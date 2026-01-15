'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/shared/navigation/navbar'

interface DashboardWrapperProps {
  children: React.ReactNode
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const pathname = usePathname()
  const isWorkspaceRoute = pathname.includes('/workspace/')
  const isHomeRoute = pathname === '/home'

  if (isWorkspaceRoute || isHomeRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        {children}
      </main>
    </div>
  )
}
