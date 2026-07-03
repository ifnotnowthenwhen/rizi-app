import { useState } from 'react'
import type { DayRecord, BodyPlanType } from '../types'
import { getTodayStr } from '../utils/date'
import EditableTag from './EditableTag'

interface Props {
  record: DayRecord
  onComplete: () => void
  onClose: () => void
  updateData: (fn: (d: any) => void) => void
  initialMode?: 'plan' | 'done'
}

const PLAN_OPTIONS: { type: BodyPlanType; label: string; icon: string }[] = [
  { type: 'walk', label: '散步', icon: '🚶' },
  { type: 'bike', label: '骑车', icon: '🚴' },
  { type: 'exercise', label: '健身操', icon: '🤸' },
]

export default function BodyModal({ record, onComplete, onClose, updateData, initialMode }: Props) {
  const hasPlans = record.modules.body.plans.length > 0
  const [mode, setMode] = useState<'plan' | 'done'>(initialMode ?? (hasPlans ? 'done' : 'plan'))
  const [selectedPlans, setSelectedPlans] = useState<BodyPlanType[]>(
    record.modules.body.plans.map(p => p.type)
  )
  const [customEntries, setCustomEntries] = useState<{id: string; text: string}[]>([])
  const [doneDurations, setDoneDurations] = useState<Record<string, number>>(
    Object.fromEntries(record.modules.body.dones.map(d => [d.type, d.duration ?? 20]))
  )
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set(
    record.modules.body.plans
      .filter(p => record.modules.body.dones.some(d => d.type === p.type && d.customText === p.customText))
      .map(p => p.id || p.type)
  ))

  const togglePlan = (type: BodyPlanType) => {
    setSelectedPlans(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const handlePlan = () => {
    updateData((d: any) => {
      const today = d.records.find((r: DayRecord) => r.date === getTodayStr())
      if (!today) return
      const now = new Date().toISOString()
      const makeId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      today.modules.body.plans = [
        ...selectedPlans.map(type => ({ id: makeId(), type, timestamp: now })),
        ...customEntries.map(ce => ({ id: makeId(), type: 'custom' as BodyPlanType, customText: ce.text || undefined, timestamp: now })),
      ]
    })
    onClose()
  }

  const toggleDone = (doneKey: string) => {
    setDoneSet(prev => {
      const next = new Set(prev)
      if (next.has(doneKey)) next.delete(doneKey)
      else next.add(doneKey)
      return next
    })
  }

  const handleDone = () => {
    updateData((d: any) => {
      const today = d.records.find((r: DayRecord) => r.date === getTodayStr())
      if (!today) return
      const now = new Date().toISOString()
      today.modules.body.dones = Array.from(doneSet).map(doneKey => {
        const plan = today.modules.body.plans.find((p: any) => (p.id || p.type) === doneKey)
        return {
          type: (plan?.type || 'custom') as BodyPlanType,
          duration: doneDurations[plan?.type ?? ''] ?? 20,
          customText: plan?.customText,
          timestamp: now,
        }
      })
      if (doneSet.size > 0) today.modules.body.completed = true
    })
    if (doneSet.size > 0) onComplete()
    onClose()
  }

  const displayLabel = (plan: any) => {
    if (plan.type === 'custom') return plan.customText || '干点别的'
    const opt = PLAN_OPTIONS.find(o => o.type === plan.type)
    return opt ? `${opt.icon} ${opt.label}` : plan.type
  }

  const displayedPlans = hasPlans ? record.modules.body.plans : []

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 animate-fade-in" onClick={onClose}>
      <div className="bg-cream rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">🧘</div>
          <h3 className="text-base text-caramel font-medium">{mode === 'plan' ? 'Plan' : 'Done'}</h3>
          <p className="text-xs text-deep-brown mt-0.5">
            {mode === 'plan' ? '今天想怎么动？' : '今天做了什么运动？'}
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
              {/* Custom entries */}
              {customEntries.map(entry => (
                <div key={entry.id} className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-dashed border-sage">
                  <span className="text-light-brown text-xs">✏️</span>
                  <input
                    autoFocus
                    value={entry.text}
                    onChange={e => setCustomEntries(prev =>
                      prev.map(ce => ce.id === entry.id ? { ...ce, text: e.target.value } : ce)
                    )}
                    placeholder="写点什么..."
                    className="flex-1 text-sm text-caramel bg-transparent outline-none"
                  />
                  <button
                    onClick={() => setCustomEntries(prev => prev.filter(ce => ce.id !== entry.id))}
                    className="text-light-brown hover:text-deep-brown text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div
                onClick={() => {
                  const id = `_c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
                  setCustomEntries(prev => [...prev, { id, text: '' }])
                }}
                className="bg-warm-gray rounded-xl px-4 py-3 text-sm text-deep-brown text-center border border-dashed border-light-brown cursor-pointer hover:bg-cream transition-colors"
              >
                + 干点别的
              </div>
            </div>
            <button onClick={handlePlan} disabled={selectedPlans.length === 0 && customEntries.length === 0}
              className="mt-4 w-full py-2.5 rounded-xl text-sm text-white bg-sage disabled:opacity-40">✓ 定下计划</button>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {displayedPlans.map(plan => {
                const doneKey = plan.id || `${plan.type}-0`
                return (
                  <div key={doneKey} className="bg-white rounded-xl px-4 py-3 border border-warm-gray">
                    <div className="flex items-center gap-2.5" onClick={() => toggleDone(doneKey)}>
                      <span className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center text-xs cursor-pointer transition-all ${
                        doneSet.has(doneKey) ? 'bg-sage border-sage text-white' : 'border-light-brown'
                      }`}>{doneSet.has(doneKey) ? '✓' : ''}</span>
                      <span className={`text-sm ${doneSet.has(doneKey) ? 'text-deep-brown line-through' : 'text-caramel'}`}>
                        {displayLabel(plan)}
                      </span>
                      <span className="ml-auto">
                        <EditableTag value={doneDurations[plan.type] ?? 20} suffix="分钟"
                          onChange={val => setDoneDurations(prev => ({ ...prev, [plan.type]: val }))}
                          done={doneSet.has(doneKey)} />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <button onClick={handleDone}
              className="mt-4 w-full py-2.5 rounded-xl text-sm text-white bg-light-brown hover:opacity-90">✓ 更新完成</button>
          </>
        )}
      </div>
    </div>
  )
}
