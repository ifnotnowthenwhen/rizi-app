import type { AppData, ModuleType, JobDone, InputDone, BodyDone, TraceDone } from '../types'
import { getWeekDates } from './date'

export interface WeeklyStats {
  weekDates: string[]
  dailyCounts: number[]
  totalCompleted: number
  totalPossible: number
  moduleDetails: Record<ModuleType, string[]>
}

export function getWeeklyStats(data: AppData, dateStr: string): WeeklyStats {
  const weekDates = getWeekDates(dateStr)
  const dailyCounts: number[] = []
  let totalCompleted = 0

  const moduleDetails: Record<ModuleType, string[]> = {
    job: [],
    input: [],
    body: [],
    trace: [],
  }

  for (const d of weekDates) {
    const record = data.records.find(r => r.date === d)
    if (record) {
      let dayCount = 0
      const modules: ModuleType[] = ['job', 'input', 'body', 'trace']
      for (const m of modules) {
        if (record.modules[m].completed) {
          dayCount++
          totalCompleted++
        }
        for (const done of record.modules[m].dones) {
          const detail = formatDoneDetail(m, done)
          if (detail) moduleDetails[m].push(detail)
        }
      }
      dailyCounts.push(dayCount)
    } else {
      dailyCounts.push(0)
    }
  }

  return {
    weekDates,
    dailyCounts,
    totalCompleted,
    totalPossible: 28,
    moduleDetails,
  }
}

function formatDoneDetail(module: ModuleType, done: JobDone | InputDone | BodyDone | TraceDone): string {
  switch (module) {
    case 'job': {
      const j = done as JobDone
      if (j.type === 'custom') return j.customText || '干点别的'
      const typeLabel: Record<string, string> = {
        collect: '收藏',
        submit: '投递',
        resume: '修改简历',
        portfolio: '修改作品集',
      }
      const label = typeLabel[j.type] || j.type
      return j.count ? `${label} ${j.count}${j.type === 'collect' ? ' 个' : ' 份'}` : label
    }
    case 'input': {
      const i = done as InputDone
      if (i.type === 'custom') return i.customText || '干点别的'
      const inputLabel: Record<string, string> = {
        read: '阅读',
        study: '学习',
        course: '看课程',
        case: '看案例',
      }
      const iLabel = inputLabel[i.type] || i.type
      const content = i.content ? `《${i.content}》` : ''
      return i.duration ? `${iLabel}${content} ${i.duration} 分钟` : iLabel
    }
    case 'body': {
      const b = done as BodyDone
      if (b.type === 'custom') return b.customText || '干点别的'
      const bodyLabel: Record<string, string> = {
        walk: '散步',
        bike: '骑车',
        exercise: '健身操',
      }
      const bLabel = bodyLabel[b.type] || b.type
      return b.duration ? `${bLabel} ${b.duration} 分钟` : bLabel
    }
    case 'trace': {
      const t = done as TraceDone
      if (t.type === 'custom') return t.customText || '干点别的'
      const traceLabel: Record<string, string> = {
        diary: '写日记',
        write: '写作',
        chore: '做家务',
      }
      const tLabel = traceLabel[t.type] || t.type
      return t.description ? `${tLabel} · ${t.description}` : tLabel
    }
    default:
      return ''
  }
}
