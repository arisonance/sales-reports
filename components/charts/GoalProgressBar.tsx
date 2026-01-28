'use client'

interface GoalProgressBarProps {
  current: number
  goal: number
  showPercentage?: boolean
  height?: 'sm' | 'md' | 'lg'
}

export default function GoalProgressBar({
  current,
  goal,
  showPercentage = true,
  height = 'md'
}: GoalProgressBarProps) {
  const percentage = goal > 0 ? Math.round((current / goal) * 100) : 0
  const cappedPercentage = Math.min(percentage, 100)

  // Determine color based on percentage
  const getBarColor = () => {
    if (percentage >= 100) return 'bg-sonance-green'
    if (percentage >= 90) return 'bg-sonance-blue'
    return 'bg-red-500'
  }

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className="w-full">
      <div className={`relative ${heightClasses[height]} bg-muted/30 rounded-full overflow-hidden`}>
        <div
          className={`absolute h-full ${getBarColor()} rounded-full transition-all duration-500`}
          style={{ width: `${cappedPercentage}%` }}
        />
        {percentage > 100 && (
          <div
            className="absolute h-full bg-sonance-green/30 rounded-full"
            style={{ width: '100%' }}
          />
        )}
      </div>
      {showPercentage && (
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs font-semibold ${
            percentage >= 100 ? 'text-sonance-green' :
            percentage >= 90 ? 'text-sonance-blue' :
            'text-red-500'
          }`}>
            {percentage}%
          </span>
          {percentage > 100 && (
            <span className="text-xs text-sonance-green">
              +{percentage - 100}% over goal
            </span>
          )}
        </div>
      )}
    </div>
  )
}
