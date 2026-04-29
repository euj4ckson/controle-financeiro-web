interface SummaryCardProps {
  label: string
  value: string
  tone: 'positive' | 'negative' | 'neutral'
}

export function SummaryCard({ label, value, tone }: SummaryCardProps) {
  return (
    <article className={`summary-card summary-card--${tone}`}>
      <span className="summary-card__label">{label}</span>
      <strong className="summary-card__value">{value}</strong>
    </article>
  )
}
