import { useState, useRef, useEffect } from 'react'

interface Props {
  value: number
  suffix: string
  onChange: (val: number) => void
  done?: boolean
}

export default function EditableTag({ value, suffix, onChange, done }: Props) {
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleSave = () => {
    const num = parseInt(inputVal, 10)
    if (!isNaN(num) && num >= 0) {
      onChange(num)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1 bg-white border border-sage rounded-md px-2 py-0.5">
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onBlur={handleSave}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="w-7 text-center text-xs text-caramel bg-transparent outline-none"
        />
        <span className="text-xs text-deep-brown">{suffix}</span>
        <button onClick={handleSave} className="text-xs text-sage">✓</button>
      </span>
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs cursor-pointer transition-colors ${
        done
          ? 'bg-sage-light text-sage-dark'
          : 'bg-cream text-deep-brown hover:bg-warm-gray'
      }`}
    >
      <span className="opacity-50">✏️</span>
      <span className="font-medium">{value}</span>
      <span>{suffix}</span>
    </span>
  )
}
