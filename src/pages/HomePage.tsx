import { useState } from 'react'
import { getTodayStr, getDisplayDate } from '../utils/date'
import { useAppData } from '../hooks/useLocalStorage'
import { useToday, useTodayCompletedCount } from '../hooks/useToday'
import ProgressBar from '../components/ProgressBar'
import ModuleCard from '../components/ModuleCard'
import FeedbackBanner from '../components/FeedbackBanner'
import type { ModuleType, DayRecord, AppData, JobPlanType } from '../types'

const MODULES: { key: ModuleType; icon: string; label: string }[] = [
  { key: 'job', icon: '💼', label: '工作' },
  { key: 'input', icon: '📖', label: '输入' },
  { key: 'body', icon: '🧘', label: '身体' },
  { key: 'trace', icon: '✨', label: '痕迹' },
]

export default function HomePage() {
  const { data, updateData } = useAppData()
  const todayRecord = useToday(data)
  const completedCount = useTodayCompletedCount(todayRecord)
  const [activeModal, setActiveModal] = useState<ModuleType | null>(null)
  const [justCompleted, setJustCompleted] = useState<string | null>(null)

  const handleModuleComplete = (module: ModuleType) => {
    updateData(d => {
      const record = d.records.find(r => r.date === getTodayStr())
      if (record) {
        record.modules[module].completed = true
      }
    })
    setJustCompleted(module)
    setTimeout(() => setJustCompleted(null), 100)
  }

  return (
    <div className="py-6">
      {/* 日期和问候 */}
      <div className="text-center mb-6">
        <p className="text-xs text-deep-brown tracking-wide">{getDisplayDate(getTodayStr())}</p>
        <p className="text-xl text-caramel mt-1.5 tracking-widest">熙言，你好</p>
      </div>

      {/* 进度条 */}
      <div className="mb-7">
        <ProgressBar
          current={completedCount}
          total={4}
          label="今日流动度"
        />
      </div>

      {/* 四个模块 */}
      <div className="grid grid-cols-2 gap-3">
        {MODULES.map(m => (
          <ModuleCard
            key={m.key}
            icon={m.icon}
            label={m.label}
            completed={todayRecord.modules[m.key].completed}
            onClick={() => setActiveModal(m.key)}
          />
        ))}
      </div>

      {/* 反馈文案 */}
      <FeedbackBanner justCompleted={justCompleted} />

      {/* 弹窗区域 - modal components rendered inline */}
      {activeModal === 'job' && (
        <JobModalContent
          record={todayRecord}
          onComplete={() => handleModuleComplete('job')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal === 'input' && (
        <InputModalContent
          record={todayRecord}
          onComplete={() => handleModuleComplete('input')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal === 'body' && (
        <BodyModalContent
          record={todayRecord}
          onComplete={() => handleModuleComplete('body')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal === 'trace' && (
        <TraceModalContent
          record={todayRecord}
          onComplete={() => handleModuleComplete('trace')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
    </div>
  )
}

/* === Work Modal (placeholder, will be replaced by JobModal.tsx) === */
function JobModalContent({ record, onComplete, onClose, updateData }: {
  record: DayRecord; onComplete: () => void; onClose: () => void; updateData: (fn: (d: AppData) => void) => void
}) {
  const [showPlan, setShowPlan] = useState(true)
  const [selected, setSelected] = useState<JobPlanType[]>([])
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set())
  const [doneCounts, setDoneCounts] = useState<Record<string, number>>({})

  const PLAN_OPTIONS = [
    { type: 'collect' as JobPlanType, label: '收藏 5 个岗位', icon: '📌' },
    { type: 'submit' as JobPlanType, label: '投递 5 份简历', icon: '📬' },
    { type: 'resume' as JobPlanType, label: '修改简历', icon: '📝' },
    { type: 'portfolio' as JobPlanType, label: '修改作品集', icon: '🎨' },
  ]

  const hasPlans = record.modules.job.plans.length > 0

  if (!hasPlans && showPlan) return (
    <ModalShell icon="💼" onClose={onClose}>
      <div className="text-center mb-4">
        <h3 className="text-base text-caramel font-medium">Plan</h3>
        <p className="text-xs text-deep-brown mt-0.5">今天计划做什么？</p>
      </div>
      <div className="flex flex-col gap-2">
        {PLAN_OPTIONS.map(opt => (
          <div key={opt.type} onClick={() => setSelected(prev =>
            prev.includes(opt.type) ? prev.filter(t => t !== opt.type) : [...prev, opt.type]
          )}
            className={`flex items-center gap-2.5 bg-white rounded-xl px-4 py-3 text-sm cursor-pointer transition-all ${
              selected.includes(opt.type) ? 'border-2 border-sage' : 'border border-warm-gray'
            }`}>
            <span className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center text-xs transition-all ${
              selected.includes(opt.type) ? 'bg-sage border-sage text-white' : 'border-light-brown'
            }`}>{selected.includes(opt.type) ? '✓' : ''}</span>
            <span className="text-caramel">{opt.icon} {opt.label}</span>
          </div>
        ))}
      </div>
      <button onClick={() => {
        updateData(d => {
          const today = d.records.find(r => r.date === getTodayStr())
          if (!today) return
          today.modules.job.plans = selected.map(type => ({ type, timestamp: new Date().toISOString() }))
        })
        setShowPlan(false)
      }} disabled={selected.length === 0}
        className="mt-4 w-full py-2.5 rounded-xl text-sm text-white bg-sage disabled:opacity-40">✓ 定下计划</button>
    </ModalShell>
  )

  const plannedTypes = hasPlans
    ? record.modules.job.plans.map(p => p.type)
    : selected

  return (
    <ModalShell icon="💼" onClose={onClose}>
      <div className="text-center mb-4">
        <h3 className="text-base text-caramel font-medium">Done</h3>
        <p className="text-xs text-deep-brown mt-0.5">实际完成了什么？</p>
      </div>
      <div className="flex flex-col gap-2">
        {plannedTypes.map(type => (
          <div key={type} className="bg-white rounded-xl px-4 py-3 border border-warm-gray">
            <div className="flex items-center gap-2.5" onClick={() => setDoneSet(prev => {
              const next = new Set(prev)
              if (next.has(type)) next.delete(type)
              else next.add(type)
              return next
            })}>
              <span className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center text-xs cursor-pointer ${
                doneSet.has(type) ? 'bg-sage border-sage text-white' : 'border-light-brown'
              }`}>{doneSet.has(type) ? '✓' : ''}</span>
              <span className={`text-sm ${doneSet.has(type) ? 'text-deep-brown line-through' : 'text-caramel'}`}>
                {PLAN_OPTIONS.find(o => o.type === type)?.icon} {PLAN_OPTIONS.find(o => o.type === type)?.label.replace(/\d+/, '') || type}
              </span>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => {
        updateData(d => {
          const today = d.records.find(r => r.date === getTodayStr())
          if (!today) return
          today.modules.job.dones = Array.from(doneSet).map(type => ({
            type: type as JobPlanType,
            count: doneCounts[type] ?? 5,
            timestamp: new Date().toISOString(),
          }))
          if (doneSet.size > 0) today.modules.job.completed = true
        })
        if (doneSet.size > 0) onComplete()
        onClose()
      }} className="mt-4 w-full py-2.5 rounded-xl text-sm text-white bg-light-brown">✓ 更新完成</button>
    </ModalShell>
  )
}

/* === Input Modal (placeholder) === */
function InputModalContent({ record, onComplete, onClose, updateData }: {
  record: DayRecord; onComplete: () => void; onClose: () => void; updateData: (fn: (d: AppData) => void) => void
}) {
  return (
    <ModalShell icon="📖" onClose={onClose}>
      <p className="text-center text-xs text-deep-brown mt-2">输入模块（将在后续任务实现）</p>
      <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-xl text-sm text-white bg-sage">关闭</button>
    </ModalShell>
  )
}

/* === Body Modal (placeholder) === */
function BodyModalContent({ onClose }: {
  record: DayRecord; onComplete: () => void; onClose: () => void; updateData: (fn: (d: AppData) => void) => void
}) {
  return (
    <ModalShell icon="🧘" onClose={onClose}>
      <p className="text-center text-xs text-deep-brown mt-2">身体模块（将在后续任务实现）</p>
      <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-xl text-sm text-white bg-sage">关闭</button>
    </ModalShell>
  )
}

/* === Trace Modal (placeholder) === */
function TraceModalContent({ onClose }: {
  record: DayRecord; onComplete: () => void; onClose: () => void; updateData: (fn: (d: AppData) => void) => void
}) {
  return (
    <ModalShell icon="✨" onClose={onClose}>
      <p className="text-center text-xs text-deep-brown mt-2">痕迹模块（将在后续任务实现）</p>
      <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-xl text-sm text-white bg-sage">关闭</button>
    </ModalShell>
  )
}

/* === Modal Shell === */
function ModalShell({ icon, children, onClose }: { icon: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 animate-fade-in" onClick={onClose}>
      <div className="bg-cream rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-2">
          <div className="text-3xl mb-1">{icon}</div>
        </div>
        {children}
      </div>
    </div>
  )
}
