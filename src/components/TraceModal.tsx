import { useState } from 'react'
import type { DayRecord, TracePlanType, TracePlan } from '../types'
import { getTodayStr } from '../utils/date'

interface Props {
  record: DayRecord
  onComplete: () => void
  onClose: () => void
  updateData: (fn: (d: any) => void) => void
  initialMode?: 'plan' | 'done'
}

const PLAN_OPTIONS: { type: TracePlanType; label: string; icon: string }[] = [
  { type: 'diary', label: '日记', icon: '📔' },
  { type: 'write', label: '写作', icon: '✍️' },
  { type: 'chore', label: '家务', icon: '🧹' },
]

export default function TraceModal({ record, onComplete, onClose, updateData, initialMode }: Props) {
  const hasPlans = record.modules.trace.plans.length > 0
  const [mode, setMode] = useState<'plan' | 'done'>(initialMode ?? (hasPlans ? 'done' : 'plan'))
  const [selectedPlans, setSelectedPlans] = useState<TracePlanType[]>(
    record.modules.trace.plans.map(p => p.type)
  )
  const [customText, setCustomText] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [doneDescriptions, setDoneDescriptions] = useState<Record<string, string>>(
    Object.fromEntries(record.modules.trace.dones.map(d => [d.type, d.description ?? '']))
  )
  const [doneSet, setDoneSet] = useState<Set<string>>(
    new Set(record.modules.trace.dones.map(d => d.type))
  )

  const togglePlan = (type: TracePlanType) => {
    setSelectedPlans(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const handlePlan = () => {
    updateData((d: any) => {
      const today = d.records.find((r: DayRecord) => r.date === getTodayStr())
      if (!today) return
      today.modules.trace.plans = selectedPlans.map(type => ({
        type,
        customText: type === 'custom' ? customText : undefined,
        timestamp: new Date().toISOString(),
      }))
    })
    onClose()
  }

  const toggleDone = (type: string) => {
    setDoneSet(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const handleDone = () => {
    updateData((d: any) => {
      const today = d.records.find((r: DayRecord) => r.date === getTodayStr())
      if (!today) return
      today.modules.trace.dones = Array.from(doneSet).map(type => {
        const plan = today.modules.trace.plans.find((p: TracePlan) => p.type === type)
        return {
          type: type as TracePlanType,
          description: doneDescriptions[type] || undefined,
          customText: plan?.customText,
          timestamp: new Date().toISOString(),
        }
      })
      if (doneSet.size > 0) today.modules.trace.completed = true
    })
    if (doneSet.size > 0) onComplete()
    onClose()
  }

  const displayedPlans = hasPlans ? record.modules.trace.plans : []

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 animate-fade-in" onClick={onClose}>
      <div className="bg-cream rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">✨</div>
          <h3 className="text-base text-caramel font-medium">{mode === 'plan' ? 'Plan' : 'Done'}</h3>
          <p className="text-xs text-deep-brown mt-0.5">
            {mode === 'plan' ? '今天想留下什么痕迹？' : '今天留下的痕迹是什么？'}
          </p>
        </div>

        {mode === 'plan' ? (
          <>
            <div className="flex flex-col gap-2">
              {PLAN_OPTIONS.map(opt => (
                <div key={opt.type} onClick={() => togglePlan(opt.type)}
                  className={`flex items-center gap-2.5 bg-white rounded-xl px-4 py-3 text-sm cursor-pointer transition-all ${
                    selectedPlans.includes(opt.type) ? 'border-2 border-sage' : 'border border-warm-gray'
                  }`}>
                  <span className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center text-xs transition-all ${
                    selectedPlans.includes(opt.type) ? 'bg-sage border-sage text-white' : 'border-light-brown'
                  }`}>{selectedPlans.includes(opt.type) ? '✓' : ''}</span>
                  <span className="text-caramel">{opt.icon} {opt.label}</span>
                </div>
              ))}
              {showCustom ? (
                <div className="bg-white rounded-xl px-4 py-3 border border-dashed border-light-brown">
                  <input autoFocus value={customText} onChange={e => setCustomText(e.target.value)}
                    placeholder="做了什么？" className="w-full text-sm text-caramel bg-transparent outline-none" />
                </div>
              ) : (
                <div onClick={() => { setShowCustom(true); setSelectedPlans(prev => [...prev, 'custom']) }}
                  className="bg-warm-gray rounded-xl px-4 py-3 text-sm text-deep-brown text-center border border-dashed border-light-brown cursor-pointer">+ 干点别的</div>
              )}
            </div>
            <button onClick={handlePlan} disabled={selectedPlans.length === 0}
              className="mt-4 w-full py-2.5 rounded-xl text-sm text-white bg-sage disabled:opacity-40">✓ 定下计划</button>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {displayedPlans.map(plan => (
                <div key={plan.type} className="bg-white rounded-xl px-4 py-3 border border-warm-gray">
                  <div className="flex items-center gap-2.5" onClick={() => toggleDone(plan.type)}>
                    <span className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center text-xs cursor-pointer transition-all ${
                      doneSet.has(plan.type) ? 'bg-sage border-sage text-white' : 'border-light-brown'
                    }`}>{doneSet.has(plan.type) ? '✓' : ''}</span>
                    <span className={`text-sm ${doneSet.has(plan.type) ? 'text-deep-brown line-through' : 'text-caramel'}`}>
                      {PLAN_OPTIONS.find(o => o.type === plan.type)?.icon} {plan.type === 'custom' ? (plan.customText || '干点别的') : PLAN_OPTIONS.find(o => o.type === plan.type)?.label}
                    </span>
                  </div>
                  <div className="mt-2 ml-7">
                    <input value={doneDescriptions[plan.type] ?? ''}
                      onChange={e => setDoneDescriptions(prev => ({ ...prev, [plan.type]: e.target.value }))}
                      placeholder={plan.type === 'diary' ? '今天的感受？' : plan.type === 'write' ? '写了什么？' : plan.type === 'chore' ? '做了什么家务？' : '具体做了什么？'}
                      className="w-full text-xs text-deep-brown bg-cream rounded-md px-3 py-1.5 outline-none placeholder:text-light-brown" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleDone}
              className="mt-4 w-full py-2.5 rounded-xl text-sm text-white bg-light-brown hover:opacity-90">✓ 更新完成</button>
          </>
        )}
      </div>
    </div>
  )
}
