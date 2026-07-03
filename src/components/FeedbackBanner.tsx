import { useState, useEffect } from 'react'

const DEFAULT_TEXT = '生活流动在当下。'

const MODULE_FEEDBACK: Record<string, string> = {
  job: '主线任务推进了一小步。',
  input: '今天的你又比昨天多看见了一点世界。',
  body: '身体也参与了今天的生活。',
  trace: '世界因为你的行动发生了一点变化。',
}

interface Props {
  justCompleted?: string | null
}

export default function FeedbackBanner({ justCompleted }: Props) {
  const [text, setText] = useState(DEFAULT_TEXT)

  useEffect(() => {
    if (justCompleted && MODULE_FEEDBACK[justCompleted]) {
      setText(MODULE_FEEDBACK[justCompleted])
      const timer = setTimeout(() => {
        setText(DEFAULT_TEXT)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setText(DEFAULT_TEXT)
    }
  }, [justCompleted])

  return (
    <div className="mt-6 py-3.5 px-4 bg-sage-light rounded-xl text-center transition-all duration-500">
      <p className="text-sm text-sage-dark italic leading-relaxed">
        "{text}"
      </p>
    </div>
  )
}
