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
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (justCompleted && MODULE_FEEDBACK[justCompleted]) {
      setToast(MODULE_FEEDBACK[justCompleted])
      const timer = setTimeout(() => setToast(null), 2200)
      return () => clearTimeout(timer)
    }
  }, [justCompleted])

  return (
    <>
      {/* 底部常驻文案 */}
      <div className="mt-6 py-3.5 px-4 bg-sage-light rounded-xl text-center transition-all duration-500">
        <p className="text-sm text-sage-dark italic leading-relaxed">
          &ldquo;{DEFAULT_TEXT}&rdquo;
        </p>
      </div>

      {/* 居中弹窗 Toast — 文字直接浮现在虚化背景上 */}
      {toast && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm animate-fade-in" />
          <p className="relative text-lg text-caramel italic leading-relaxed whitespace-nowrap animate-slide-up drop-shadow-sm">
            &ldquo;{toast}&rdquo;
          </p>
        </div>
      )}
    </>
  )
}
