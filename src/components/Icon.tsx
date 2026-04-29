type IconName =
  | 'home'
  | 'wallet'
  | 'tags'
  | 'chart'
  | 'plus'
  | 'filter'
  | 'calendar'
  | 'income'
  | 'expense'
  | 'close'

interface IconProps {
  name: IconName
  className?: string
}

const iconPaths: Record<IconName, string> = {
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z',
  wallet:
    'M4 8.5A2.5 2.5 0 0 1 6.5 6H18a2 2 0 0 1 2 2v1.5H6.5a1.5 1.5 0 0 0 0 3H20V16a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 15.5z M15 12.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z',
  tags: 'M5 6.5A2.5 2.5 0 0 1 7.5 4H14l6 6-8 8-6.5-6.5A2.5 2.5 0 0 1 5 9z M9 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  chart: 'M5 19V9m7 10V5m7 14v-7',
  plus: 'M12 5v14M5 12h14',
  filter: 'M4 6h16M7 12h10m-7 6h4',
  calendar:
    'M7 4v3m10-3v3M5.5 7h13A1.5 1.5 0 0 1 20 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7zM4 10h16',
  income: 'M12 19V5m0 0-4 4m4-4 4 4',
  expense: 'M12 5v14m0 0-4-4m4 4 4-4',
  close: 'M6 6l12 12M18 6 6 18',
}

export function Icon({ name, className }: IconProps) {
  const outlinedIcons = new Set<IconName>(['chart', 'plus', 'filter', 'calendar', 'close'])
  const isOutlined = outlinedIcons.has(name)

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill={isOutlined ? 'none' : 'currentColor'}
      stroke="currentColor"
      strokeWidth={isOutlined ? 1.9 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name]} />
    </svg>
  )
}
