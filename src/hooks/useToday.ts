import { useMemo } from 'react'
import type { AppData, DayRecord, ModuleType } from '../types'
import { getTodayStr } from '../utils/date'
import { getOrCreateDayRecord } from '../utils/storage'

export function useToday(data: AppData): DayRecord {
  return useMemo(() => {
    return getOrCreateDayRecord(data, getTodayStr())
  }, [data])
}

export function useTodayCompletedCount(record: DayRecord): number {
  return useMemo(() => {
    let count = 0
    const modules: ModuleType[] = ['job', 'input', 'body', 'trace']
    for (const m of modules) {
      if (record.modules[m].completed) count++
    }
    return count
  }, [record])
}
