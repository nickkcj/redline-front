'use client'

interface LoginHeaderProps {
  appName: string
}

export function LoginHeader({ appName }: LoginHeaderProps) {
  return (
    <div className="absolute left-[10%] top-[70px] flex items-center gap-4 z-10">
      <img
        src="/seloDooorBlack.png"
        alt="Dooor Logo"
        width={56}
        height={56}
        className="w-16 h-16 object-contain"
      />
      <div className="flex flex-col">
        <div className="text-4xl font-serif font-bold text-foreground leading-tight">{appName}</div>
        <div className="text-sm font-serif font-bold text-muted-foreground mt-1">by dooor</div>
      </div>
    </div>
  )
}
