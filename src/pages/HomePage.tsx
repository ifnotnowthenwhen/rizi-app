import { useState } from 'react'
import { getTodayStr, getDisplayDate } from '../utils/date'
import { useAppData } from '../hooks/useLocalStorage'
import { useToday, useTodayCompletedCount } from '../hooks/useToday'
import ProgressBar from '../components/ProgressBar'
import FeedbackBanner from '../components/FeedbackBanner'
import JobModal from '../components/JobModal'
import InputModal from '../components/InputModal'
import BodyModal from '../components/BodyModal'
import TraceModal from '../components/TraceModal'
import type { ModuleType, JobPlan, InputPlan, BodyPlan, TracePlan } from '../types'

const MODULES: { key: ModuleType; icon: string; label: string }[] = [
  { key: 'job', icon: '💼', label: '工作' },
  { key: 'input', icon: '📖', label: '输入' },
  { key: 'body', icon: '🧘', label: '身体' },
  { key: 'trace', icon: '✨', label: '痕迹' },
]

function getPlanLabel(key: ModuleType, plan: JobPlan | InputPlan | BodyPlan | TracePlan): string {
  if (plan.type === 'custom') return plan.customText || '干点别的'
  const labels: Record<string, Record<string, string>> = {
    job: { collect: '收藏 5 个岗位', submit: '投递 5 份简历', resume: '修改简历', portfolio: '修改作品集' },
    input: { read: '阅读', study: '学习', course: '看课程', case: '看案例' },
    body: { walk: '散步', bike: '骑车', exercise: '健身操' },
    trace: { diary: '日记', write: '写作', chore: '做家务' },
  }
  return labels[key]?.[plan.type] || plan.type
}

export default function HomePage() {
  const { data, updateData } = useAppData()
  const todayRecord = useToday(data)
  const completedCount = useTodayCompletedCount(todayRecord)
  const [activeModal, setActiveModal] = useState<{ type: ModuleType; mode: 'plan' | 'done' } | null>(null)
  const [justCompleted, setJustCompleted] = useState<string | null>(null)

  const handleModuleComplete = (module: ModuleType) => {
    updateData(d => {
      const record = d.records.find(r => r.date === getTodayStr())
      if (record) {
        record.modules[module].completed = true
      }
    })
    setJustCompleted(module)
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

      {/* 四个模块 + 计划项 */}
      <div className="grid grid-cols-2 gap-3">
        {MODULES.map(m => {
          const moduleData = todayRecord.modules[m.key]
          const hasPlans = moduleData.plans.length > 0
          const plannedLabels = moduleData.plans.map(p => getPlanLabel(m.key, p as any))

          return (
            <div key={m.key} className="bg-white rounded-2xl p-4 border border-warm-gray shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{m.icon}</span>
                  <span className={`text-sm font-medium ${moduleData.completed ? 'text-deep-brown' : 'text-caramel'}`}>
                    {m.label}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setActiveModal({ type: m.key, mode: 'plan' })}
                    className="text-xs px-3 py-1.5 rounded-lg bg-cream text-caramel border border-warm-gray hover:bg-warm-gray transition-colors">
                    📋 Plan
                  </button>
                  {hasPlans && (
                    <button onClick={() => setActiveModal({ type: m.key, mode: 'done' })}
                      className="text-xs px-3 py-1.5 rounded-lg bg-sage-light text-sage-dark border border-sage/30 hover:bg-sage hover:text-white transition-colors">
                      ✅ Done
                    </button>
                  )}
                </div>
              </div>
              {moduleData.completed && <div className="text-xs text-sage mb-1">已完成</div>}
              {hasPlans && (
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {plannedLabels.map((label, i) => (
                    <span key={i} className="text-xs bg-cream text-deep-brown rounded-lg px-2.5 py-1 border border-warm-gray">
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 反馈文案 */}
      <FeedbackBanner justCompleted={justCompleted} />

      {/* 弹窗区域 */}
      {activeModal?.type === 'job' && (
        <JobModal
          record={todayRecord}
          initialMode={activeModal.mode}
          onComplete={() => handleModuleComplete('job')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal?.type === 'input' && (
        <InputModal
          record={todayRecord}
          initialMode={activeModal.mode}
          onComplete={() => handleModuleComplete('input')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal?.type === 'body' && (
        <BodyModal
          record={todayRecord}
          initialMode={activeModal.mode}
          onComplete={() => handleModuleComplete('body')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal?.type === 'trace' && (
        <TraceModal
          record={todayRecord}
          initialMode={activeModal.mode}
          onComplete={() => handleModuleComplete('trace')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
    </div>
  )
}
