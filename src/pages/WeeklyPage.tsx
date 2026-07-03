import { getTodayStr, getDisplayDate, getWeekRange, getShortWeekdayName } from '../utils/date'
import { useAppData } from '../hooks/useLocalStorage'
import { getWeeklyStats } from '../utils/stats'
import ProgressBar from '../components/ProgressBar'
import type { ModuleType } from '../types'

const MODULE_INFO: Record<ModuleType, { icon: string; label: string }> = {
  job: { icon: '💼', label: '工作' },
  input: { icon: '📖', label: '输入' },
  body: { icon: '🧘', label: '身体' },
  trace: { icon: '✨', label: '痕迹' },
}

const MODULE_ORDER: ModuleType[] = ['job', 'input', 'body', 'trace']

export default function WeeklyPage() {
  const { data } = useAppData()
  const today = getTodayStr()
  const { start, end, weekNum } = getWeekRange(today)
  const stats = getWeeklyStats(data, today)

  return (
    <div className="py-6 pb-8">
      <div className="text-center mb-5">
        <h2 className="text-base font-medium text-caramel">第 {weekNum} 周</h2>
        <p className="text-xs text-deep-brown mt-1">
          {getDisplayDate(start).split(' ')[0]} — {getDisplayDate(end).split(' ')[0]}
        </p>
      </div>

      <div className="text-center mb-6 bg-white rounded-2xl p-5 border border-warm-gray shadow-sm">
        <p className="text-xs text-deep-brown mb-2">本周流动度</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-light text-caramel">{stats.totalCompleted}</span>
          <span className="text-lg text-sage">/ {stats.totalPossible}</span>
        </div>
        <div className="mt-2.5">
          <ProgressBar current={stats.totalCompleted} total={stats.totalPossible} />
        </div>
        <p className="text-xs text-deep-brown mt-2.5 italic">"每一天都在缓慢地向前流动。"</p>
      </div>

      <h3 className="text-xs text-caramel font-medium mb-2.5">每日打卡 <span className="font-normal text-deep-brown">（完成的模块数）</span></h3>
      <div className="flex gap-1 justify-between mb-6">
        {stats.weekDates.map((date, i) => {
          const cnt = stats.dailyCounts[i]
          const weekday = getShortWeekdayName(new Date(date + 'T00:00:00'))
          const isFuture = date > today
          const bgColor = isFuture ? 'bg-cream border border-dashed border-light-brown'
            : cnt === 4 ? 'bg-sage'
            : cnt > 0 ? 'bg-light-brown'
            : 'bg-cream border border-dashed border-light-brown'
          const textColor = isFuture || cnt === 0 ? 'text-light-brown' : 'text-white'
          return (
            <div key={date} className="flex-1 text-center">
              <div className="text-[10px] text-deep-brown mb-1">{weekday}</div>
              <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs ${bgColor} ${textColor}`}>
                {isFuture ? '—' : cnt}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-3">
        {MODULE_ORDER.map(m => {
          const details = stats.moduleDetails[m]
          const info = MODULE_INFO[m]
          return (
            <div key={m}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-base">{info.icon}</span>
                <span className="text-xs font-medium text-caramel">{info.label}</span>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 border border-warm-gray">
                {details.length > 0 ? (
                  <ul className="m-0 p-0 list-none">
                    {details.map((d, i) => (
                      <li key={i} className="py-1 text-xs text-caramel border-b border-cream last:border-0">
                        · {d}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-light-brown m-0">暂无记录</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 py-3.5 px-4 bg-sage-light rounded-xl text-center">
        <p className="text-xs text-sage-dark italic">"无论如何，我为你感到骄傲。"</p>
      </div>
    </div>
  )
}
