interface Props {
  icon: string
  label: string
  completed: boolean
  onClick: () => void
}

export default function ModuleCard({ icon, label, completed, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-white rounded-2xl p-5 text-center
        border border-warm-gray shadow-sm
        transition-all duration-300 active:scale-95
        ${completed ? 'opacity-50' : 'hover:shadow-md'}
      `}
    >
      <div className="text-3xl mb-1.5">{icon}</div>
      <div className={`text-sm ${completed ? 'text-deep-brown' : 'font-medium text-caramel'}`}>
        {label}
      </div>
      {completed && (
        <div className="text-xs text-sage mt-1">已完成</div>
      )}
    </button>
  )
}
