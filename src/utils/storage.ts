import type { AppData, DayRecord, ModuleType } from '../types'
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
      if (data && Array.isArray(data.records)) return data
    }
  } catch { /* ignore */ }
  return { records: [] }
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
