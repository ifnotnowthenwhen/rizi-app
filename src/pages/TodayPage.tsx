import { useAppData } from '../hooks/useLocalStorage'
import { useToday, useTodayCompletedCount } from '../hooks/useToday'
import { getTodayStr, getDisplayDate } from '../utils/date'
import type { ModuleType } from '../types'

const MODULE_INFO: Record<ModuleType, { icon: string; label: string; options: { type: string; icon: string; label: string }[] }> = {
  job: {
    icon: '💼', label: '工作',
    options: [
      { type: 'collect', icon: '📌', label: '收藏 5 个岗位' },
      { type: 'submit', icon: '📬', label: '投递 5 份简历' },
      { type: 'resume', icon: '📝', label: '修改简历' },
      { type: 'portfolio', icon: '🎨', label: '修改作品集' },
    ],
  },
  input: {
    icon: '📖', label: '输入',
    options: [
      { type: 'read', icon: '📚', label: '阅读' },
      { type: 'study', icon: '💡', label: '学习' },
      { type: 'course', icon: '🎬', label: '看课程' },
      { type: 'case', icon: '🔍', label: '看案例' },
    ],
  },
  body: {
    icon: '🧘', label: '身体',
    options: [
      { type: 'walk', icon: '🚶', label: '散步' },
      { type: 'bike', icon: '🚴', label: '骑车' },
      { type: 'exercise', icon: '🤸', label: '健身操' },
    ],
  },
  trace: {
    icon: '✨', label: '痕迹',
    options: [
      { type: 'diary', icon: '📔', label: '日记' },
      { type: 'write', icon: '✍️', label: '写作' },
      { type: 'chore', icon: '🧹', label: '家务' },
    ],
  },
}

const MODULE_ORDER: ModuleType[] = ['job', 'input', 'body', 'trace']

export default function TodayPage() {
  const { data } = useAppData()
  const todayRecord = useToday(data)
  const completedCount = useTodayCompletedCount(todayRecord)

  const doneTypesByModule: Record<string, Set<string>> = {}
  for (const m of MODULE_ORDER) {
    doneTypesByModule[m] = new Set(todayRecord.modules[m].dones.map(d => d.type))
  }

  const allDones: { time: string; icon: string; label: string }[] = []
  for (const m of MODULE_ORDER) {
    for (const done of todayRecord.modules[m].dones) {
      const t = new Date(done.timestamp)
      const time = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
      const info = MODULE_INFO[m]
      allDones.push({ time, icon: info.icon, label: info.label })
    }
  }
  allDones.sort((a, b) => b.time.localeCompare(a.time))

  return (
    <div className="py-6">
      <div className="text-center mb-6">
        <h2 className="text-base font-medium text-caramel">{getDisplayDate(getTodayStr())}</h2>
      </div>

      {/* 已完成 */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-sage rounded-full" />
          <span className="text-sm font-medium text-caramel">已完成的</span>
          <span className="text-xs text-sage">（{completedCount}/4）</span>
        </div>

        {allDones.length === 0 ? (
          <div className="bg-cream rounded-xl py-5 text-center border border-dashed border-warm-gray">
            <p className="text-xs text-light-brown">今天还没有记录，去首页打个卡吧 ☕</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl px-4 py-3 border border-warm-gray">
            {allDones.map((d, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1.5 text-xs text-deep-brown border-b border-cream last:border-0">
                <span className="w-4 h-4 rounded-full bg-sage flex items-center justify-center text-white text-[10px] flex-shrink-0">✓</span>
                <span>{d.icon} {d.label}</span>
                <span className="ml-auto text-light-brown">{d.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 还可以做 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-light-brown rounded-full" />
          <span className="text-sm font-medium text-caramel">还可以做</span>
        </div>

        <div className="flex flex-col gap-3">
          {MODULE_ORDER.map(m => {
            const info = MODULE_INFO[m]
            const doneTypes = doneTypesByModule[m]
            return (
              <div key={m} className="bg-white rounded-xl px-4 py-3.5 border border-warm-gray">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="text-base">{info.icon}</span>
                  <span className="text-xs font-medium text-caramel">{info.label}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {info.options.map(opt => {
                    const isDone = doneTypes.has(opt.type)
                    return (
                      <span key={opt.type} className={`text-xs rounded-lg px-3 py-1.5 transition-colors ${
                        isDone
                          ? 'bg-cream text-light-brown border border-warm-gray'
                          : 'bg-cream text-caramel border border-dashed border-light-brown'
                      }`}>
                        {isDone ? `${opt.icon} ${opt.label} ✓` : `${opt.icon} ${opt.label}`}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 py-3.5 px-4 bg-cream rounded-xl text-center border border-warm-gray">
        <p className="text-xs text-deep-brown italic">
          选你想做的就好，不做完也没关系
        </p>
      </div>
    </div>
  )
}
