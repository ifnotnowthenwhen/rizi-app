export function getTodayStr(): string {
  const d = new Date()
  return formatDate(d)
}

export function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getWeekdayName(d: Date): string {
  const names = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return names[d.getDay()]
}

export function getShortWeekdayName(d: Date): string {
  const names = ['日', '一', '二', '三', '四', '五', '六']
  return names[d.getDay()]
}

export function getDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day} ${getWeekdayName(d)}`
}

export function getWeekNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - start.getTime()
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
}

export function getWeekRange(dateStr: string): { start: string; end: string; weekNum: number } {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const monDiff = day === 0 ? -6 : 1 - day
  const mon = new Date(d)
  mon.setDate(d.getDate() + monDiff)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return {
    start: formatDate(mon),
    end: formatDate(sun),
    weekNum: getWeekNumber(d),
  }
}

export function getWeekDates(dateStr: string): string[] {
  const { start } = getWeekRange(dateStr)
  const dates: string[] = []
  const d = new Date(start + 'T00:00:00')
  for (let i = 0; i < 7; i++) {
    dates.push(formatDate(d))
    d.setDate(d.getDate() + 1)
  }
  return dates
}
