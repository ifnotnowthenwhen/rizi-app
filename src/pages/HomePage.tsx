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
import TraceModal from '../components/TraceModal'
import type { ModuleType } from '../types'

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
        <TraceModal
          record={todayRecord}
          onComplete={() => handleModuleComplete('trace')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
    </div>
  )
}

