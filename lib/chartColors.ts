// Chart color constants matching Sonance brand
export const chartColors = {
  primary: '#00A3E1',      // sonance-blue
  secondary: '#00B2A9',    // sonance-green
  tertiary: '#333F48',     // sonance-charcoal
  muted: '#D9D9D6',        // sonance-light-grey
  success: '#00B2A9',      // green for on-track
  warning: '#F59E0B',      // amber for close
  danger: '#EF4444',       // red for behind-goal
  background: '#FFFFFF',
  text: '#333F48',
  grid: '#E5E7EB',
}

// Get color based on percentage to goal
export function getGoalColor(percentToGoal: number): string {
  if (percentToGoal >= 100) return chartColors.success
  if (percentToGoal >= 90) return chartColors.primary
  return chartColors.danger
}

// Format currency for chart labels
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}
