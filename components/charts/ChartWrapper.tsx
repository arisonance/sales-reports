'use client'

interface ChartWrapperProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function ChartWrapper({ title, subtitle, children }: ChartWrapperProps) {
  return (
    <div className="bg-card-bg rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">{title}</h3>
        {subtitle && (
          <p className="text-sm text-foreground opacity-60">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}
