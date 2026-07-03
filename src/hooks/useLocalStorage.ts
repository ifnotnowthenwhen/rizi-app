import { useState, useCallback } from 'react'
import { loadAppData, saveAppData } from '../utils/storage'
import type { AppData } from '../types'

export function useAppData() {
  const [data, setData] = useState<AppData>(loadAppData)

  const updateData = useCallback((fn: (d: AppData) => void) => {
    setData(prev => {
      const next = { ...prev, records: [...prev.records] }
      fn(next)
      saveAppData(next)
      return next
    })
  }, [])

  const refresh = useCallback(() => {
    setData(loadAppData())
  }, [])

  return { data, updateData, refresh }
}
