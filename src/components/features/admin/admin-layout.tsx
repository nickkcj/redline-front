"use client"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
