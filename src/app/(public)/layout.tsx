import { Navbar } from "@/components/shared/navigation/navbar"
import { BackgroundVideo } from "@/components/shared/layout/background-video"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function PublicLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundVideo opacity={0.8} />

      <div className="relative z-20">
        <Navbar />
        {children}
      </div>
    </div>
  )
}
