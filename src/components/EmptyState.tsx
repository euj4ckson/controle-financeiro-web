interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="feedback-card">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}
