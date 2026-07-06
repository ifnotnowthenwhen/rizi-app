import type { AppData, DayRecord, ModuleType, RecurringTask } from '../types'
import { getTodayStr } from './date'

const STORAGE_KEY = '日子-app-data'

function getEmptyModule() {
  return {
    completed: false,
    plans: [],
    dones: [],
  }
}

function getEmptyDayRecord(date: string): DayRecord {
  return {
    date,
    modules: {
      job: { ...getEmptyModule() },
      input: { ...getEmptyModule() },
      body: { ...getEmptyModule() },
      trace: { ...getEmptyModule() },
    },
  }
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as AppData
      if (data && Array.isArray(data.records)) {
        // Handle old data that doesn't have new fields
        if (!data.recurringTasks) data.recurringTasks = []
        if (!data.todos) data.todos = []
        return data
      }
    }
  } catch { /* ignore */ }
  return { records: [], recurringTasks: [], todos: [] }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getOrCreateDayRecord(data: AppData, date?: string): DayRecord {
  const targetDate = date || getTodayStr()
  let record = data.records.find(r => r.date === targetDate)
  if (!record) {
    record = getEmptyDayRecord(targetDate)
    data.records.push(record)
    saveAppData(data)
  }
  return record
}

export function getTodayRecord(data: AppData): DayRecord {
  return getOrCreateDayRecord(data)
}

export function markModuleCompleted(data: AppData, date: string, module: ModuleType): void {
  const record = getOrCreateDayRecord(data, date)
  record.modules[module].completed = true
  saveAppData(data)
}

export function getNextReset(task: RecurringTask): Date {
  const now = new Date()
  switch (task.frequency) {
    case 'weekly': {
      // Next Monday
      const next = new Date(now)
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7 // 1=Mon...0=Sun
      next.setDate(now.getDate() + daysUntilMonday)
      next.setHours(0, 0, 0, 0)
      return next
    }
    case 'monthly': {
      // 1st of next month
      const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      next.setHours(0, 0, 0, 0)
      return next
    }
    case 'yearly': {
      // Jan 1st of next year
      const next = new Date(now.getFullYear() + 1, 0, 1)
      next.setHours(0, 0, 0, 0)
      return next
    }
    case 'custom': {
      if (task.customDays) {
        const next = new Date(now)
        next.setDate(now.getDate() + task.customDays)
        next.setHours(0, 0, 0, 0)
        return next
      }
      return now
    }
  }
}

export function getDaysUntilNextReset(task: RecurringTask): number {
  const now = new Date()
  const next = getNextReset(task)
  const diff = next.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isCompletedThisCycle(task: RecurringTask): boolean {
  if (!task.lastCompletedDate) return false
  const completed = new Date(task.lastCompletedDate)
  const nextReset = getNextReset(task)
  const lastReset = new Date(nextReset)
  // Go back one cycle
  switch (task.frequency) {
    case 'weekly': lastReset.setDate(lastReset.getDate() - 7); break
    case 'monthly': lastReset.setMonth(lastReset.getMonth() - 1); break
    case 'yearly': lastReset.setFullYear(lastReset.getFullYear() - 1); break
    case 'custom': {
      if (task.customDays) lastReset.setDate(lastReset.getDate() - task.customDays)
      break
    }
  }
  return completed >= lastReset
}

export function getCycleDays(task: RecurringTask): number {
  switch (task.frequency) {
    case 'weekly': return 7
    case 'monthly': {
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    }
    case 'yearly': {
      const now = new Date()
      const year = now.getFullYear()
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365
    }
    case 'custom': return task.customDays || 7
  }
}
