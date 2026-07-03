interface Props {
  current: number
  total: number
  label?: string
}

export default function ProgressBar({ current, total, label }: Props) {
  const pct = total > 0 ? (current / total) * 100 : 0

  return (
    <div>
      {label && (
        <div className="flex justify-between text-sm text-deep-brown mb-2">
          <span>{label}</span>
          <span>{current}/{total}</span>
        </div>
      )}
      <div className="h-1.5 bg-warm-gray rounded-full overflow-hidden">
        <div
          className="h-full bg-sage rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
