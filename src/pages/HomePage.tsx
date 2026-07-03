import { useState } from 'react'
import { getTodayStr, getDisplayDate } from '../utils/date'
import { useAppData } from '../hooks/useLocalStorage'
import { useToday, useTodayCompletedCount } from '../hooks/useToday'
import ProgressBar from '../components/ProgressBar'
import ModuleCard from '../components/ModuleCard'
import FeedbackBanner from '../components/FeedbackBanner'
import JobModal from '../components/JobModal'
import InputModal from '../components/InputModal'
import BodyModal from '../components/BodyModal'
import type { ModuleType, DayRecord, AppData } from '../types'

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
        <JobModal
          record={todayRecord}
          onComplete={() => handleModuleComplete('job')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal === 'input' && (
        <InputModal
          record={todayRecord}
          onComplete={() => handleModuleComplete('input')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal === 'body' && (
        <BodyModal
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
