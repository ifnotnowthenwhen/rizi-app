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
import type { ModuleType } from '../types'

const MODULES: { key: ModuleType; icon: string; label: string; color: string }[] = [
  { key: 'job', icon: '💼', label: '工作', color: 'border-l-sage' },
  { key: 'input', icon: '📖', label: '输入', color: 'border-l-blue-300' },
  { key: 'body', icon: '🧘', label: '身体', color: 'border-l-amber-300' },
  { key: 'trace', icon: '✨', label: '痕迹', color: 'border-l-purple-300' },
]

const PLAN_LABELS: Record<string, Record<string, string>> = {
  job: { collect: '收藏 5 个岗位', submit: '投递 5 份简历', resume: '修改简历', portfolio: '修改作品集' },
  input: { read: '阅读', study: '学习', course: '看课程', case: '看案例' },
  body: { walk: '散步', bike: '骑车', exercise: '健身操' },
  trace: { diary: '日记', write: '写作', chore: '做家务' },
}

export default function HomePage() {
  const { data, updateData } = useAppData()
  const todayRecord = useToday(data)
  const completedCount = useTodayCompletedCount(todayRecord)
  const [activeModal, setActiveModal] = useState<{ type: ModuleType; mode: 'plan' | 'done' } | null>(null)
  const [justCompleted, setJustCompleted] = useState<string | null>(null)

  const handleModuleComplete = (module: ModuleType) => {
    updateData(d => {
      const record = d.records.find((r: any) => r.date === getTodayStr())
      if (record) {
        record.modules[module].completed = true
      }
    })
    setJustCompleted(module)
  }

  const handleItemDone = (module: ModuleType, planType: string) => {
    const plan = todayRecord.modules[module].plans.find(p => p.type === planType)
    updateData(d => {
      const record = d.records.find((r: any) => r.date === getTodayStr())
      if (!record) return
      // Remove from plans (so user can re-plan later)
      record.modules[module].plans = (record.modules[module].plans as any[]).filter(
        (p: any) => p.type !== planType
      ) as any
      // Add to dones
      record.modules[module].dones.push({
        type: planType as any,
        ...(plan?.customText ? { customText: plan.customText } : {}),
        timestamp: new Date().toISOString(),
      })
      // Check if module should be completed
      if (record.modules[module].dones.length > 0) {
        record.modules[module].completed = true
      }
    })
    setJustCompleted(module)
  }

  const getPlanLabel = (module: ModuleType, type: string, customText?: string) => {
    if (type === 'custom') return customText || '干点别的'
    return PLAN_LABELS[module]?.[type] || type
  }

  const getModuleProgress = (module: ModuleType) => {
    const m = todayRecord.modules[module]
    const doneCount = m.dones.length
    const planCount = m.plans.length
    return `${doneCount}/${planCount}`
  }

  return (
    <div className="py-6">
      {/* 日期和问候 */}
      <div className="text-center mb-6">
        <p className="text-xs text-deep-brown tracking-wide">{getDisplayDate(getTodayStr())}</p>
        <p className="text-xl text-caramel mt-1.5 tracking-widest">熙言，你好</p>
      </div>

      {/* 进度条 */}
      <div className="mb-7 px-1">
        <ProgressBar current={completedCount} total={4} label="今日流动度" />
      </div>

      {/* 模块列表 */}
      <div className="flex flex-col gap-4">
        {MODULES.map(m => {
          const moduleData = todayRecord.modules[m.key]
          const hasPlans = moduleData.plans.length > 0
          const allDone = hasPlans && moduleData.plans.every(p =>
            moduleData.dones.some(d => d.type === p.type)
          )

          return (
            <div
              key={m.key}
              className={`bg-white rounded-2xl border border-warm-gray shadow-sm overflow-hidden transition-all duration-300 ${
                allDone ? 'opacity-50' : ''
              }`}
            >
              {/* 头部 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-cream">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <span className="text-sm font-medium text-caramel">{m.label}</span>
                    {hasPlans && (
                      <span className="text-xs text-deep-brown ml-2">
                        {getModuleProgress(m.key)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModal({ type: m.key, mode: 'plan' })}
                    className="text-xs px-3.5 py-1.5 rounded-lg bg-cream text-caramel border border-warm-gray hover:bg-warm-gray transition-colors"
                  >
                    + 计划
                  </button>
                  {hasPlans && (
                    <button
                      onClick={() => setActiveModal({ type: m.key, mode: 'done' })}
                      className="text-xs px-3.5 py-1.5 rounded-lg bg-sage-light text-sage-dark border border-sage/30 hover:bg-sage hover:text-white transition-colors"
                    >
                      ✓ 完成
                    </button>
                  )}
                </div>
              </div>

              {/* 计划列表 */}
              <div className="px-5 py-3">
                {hasPlans ? (
                  <div className="flex flex-col gap-1.5">
                    {moduleData.plans.map(plan => {
                      const isDone = moduleData.dones.some(d => d.type === plan.type)
                      const label = getPlanLabel(m.key, plan.type, plan.customText)

                      if (isDone) return null // Don't show done items

                      return (
                        <div
                          key={plan.type + (plan.customText || '')}
                          onClick={() => handleItemDone(m.key, plan.type)}
                          className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-cream cursor-pointer group transition-colors"
                        >
                          <span className="w-5 h-5 rounded-full border-2 border-light-brown flex items-center justify-center group-hover:border-sage transition-colors flex-shrink-0">
                            <span className="w-2 h-2 rounded-full bg-transparent group-hover:bg-sage transition-colors" />
                          </span>
                          <span className="text-sm text-caramel flex-1">{label}</span>
                          <span className="text-xs text-light-brown opacity-0 group-hover:opacity-100 transition-opacity">
                            点击完成
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-light-brown text-center py-3">
                    今天还没有计划
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 反馈文案 */}
      <FeedbackBanner justCompleted={justCompleted} />

      {/* 弹窗 */}
      {activeModal?.mode === 'plan' && activeModal.type === 'job' && (
        <JobModal
          record={todayRecord}
          initialMode="plan"
          onComplete={() => handleModuleComplete('job')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal?.mode === 'plan' && activeModal.type === 'input' && (
        <InputModal
          record={todayRecord}
          initialMode="plan"
          onComplete={() => handleModuleComplete('input')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal?.mode === 'plan' && activeModal.type === 'body' && (
        <BodyModal
          record={todayRecord}
          initialMode="plan"
          onComplete={() => handleModuleComplete('body')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal?.mode === 'plan' && activeModal.type === 'trace' && (
        <TraceModal
          record={todayRecord}
          initialMode="plan"
          onComplete={() => handleModuleComplete('trace')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}

      {/* Done 弹窗 */}
      {activeModal?.mode === 'done' && activeModal.type === 'job' && (
        <JobModal
          record={todayRecord}
          initialMode="done"
          onComplete={() => handleModuleComplete('job')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal?.mode === 'done' && activeModal.type === 'input' && (
        <InputModal
          record={todayRecord}
          initialMode="done"
          onComplete={() => handleModuleComplete('input')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal?.mode === 'done' && activeModal.type === 'body' && (
        <BodyModal
          record={todayRecord}
          initialMode="done"
          onComplete={() => handleModuleComplete('body')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
      {activeModal?.mode === 'done' && activeModal.type === 'trace' && (
        <TraceModal
          record={todayRecord}
          initialMode="done"
          onComplete={() => handleModuleComplete('trace')}
          onClose={() => setActiveModal(null)}
          updateData={updateData}
        />
      )}
    </div>
  )
}
