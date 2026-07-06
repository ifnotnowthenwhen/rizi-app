import { useState, useEffect } from 'react'
import { useAppData } from '../hooks/useLocalStorage'
import { getDaysUntilNextReset, isCompletedThisCycle } from '../utils/storage'
import type { RecurringTask, CustomUnit, RecurringFrequency } from '../types'

// Dot matrix constants
const MATRIX_SIZE = 25
const MATRIX_COLS = 5
const MATRIX_ROWS = 5

const DOT_COLORS = [
  { light: '#7B9BB5', dark: '#2C4A6B' },  // Deep blue
  { light: '#8BB57B', dark: '#3C5A2C' },  // Forest green
  { light: '#9B8BB5', dark: '#4C3C6B' },  // Plum purple
  { light: '#B59B7B', dark: '#6B4C2C' },  // Rust orange
  { light: '#B58B9B', dark: '#6B3C4C' },  // Rose pink
  { light: '#8BABA5', dark: '#3C5A4C' },  // Teal
  { light: '#A5B5C5', dark: '#5B6B8B' },  // Slate blue
  { light: '#B5C5A5', dark: '#6B7B4C' },  // Sage
]

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 200, g: 200, b: 200 }
}

function lerpColor(color1: string, color2: string, t: number): string {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)
  const r = Math.round(c1.r + (c2.r - c1.r) * t)
  const g = Math.round(c1.g + (c2.g - c1.g) * t)
  const b = Math.round(c1.b + (c2.b - c1.b) * t)
  return `rgb(${r}, ${g}, ${b})`
}

const CONFETTI_COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8E9E', '#C084FC', '#FB923C']

function ConfettiEffect({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number; delay: number; rotation: number }[]>([])

  useEffect(() => {
    if (trigger === 0) return
    const newParticles = Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * 360
      const distance = 100 + Math.random() * 200
      const rad = (angle * Math.PI) / 180
      return {
        id: trigger * 1000 + i,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance - 80, // bias upward
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 5 + Math.random() * 7,
        delay: Math.random() * 0.15,
        rotation: Math.random() * 720,
      }
    })
    setParticles(newParticles)
    const timer = setTimeout(() => setParticles([]), 2500)
    return () => clearTimeout(timer)
  }, [trigger])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            '--x': `${p.x}px`,
            '--y': `${p.y}px`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            animationDelay: `${p.delay}s`,
            borderRadius: '3px',
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

function getLast5AM(): Date {
  const now = new Date()
  const hour = now.getHours()
  // If hour < 5, today's 5AM hasn't happened yet — use yesterday's 5AM.
  // Otherwise use today's 5AM (same code, date stays the same).
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0, 0)
}

export default function CyclePage() {
  const { data, updateData } = useAppData()
  const tasks = data.recurringTasks || []
  const todos = data.todos || []
  const visibleTodos = (todos).filter(todo => {
    if (!todo.completed) return true // incomplete always show
    if (!todo.completedAt) return true // no completedAt, show it
    const completedTime = new Date(todo.completedAt).getTime()
    const cutoff = getLast5AM().getTime()
    return completedTime >= cutoff // completed after last 5AM → still show
  })

  // Recurring task state
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskIcon, setNewTaskIcon] = useState('🧹')
  const [newTaskFreq, setNewTaskFreq] = useState<RecurringFrequency>('weekly')
  const [newTaskCustomValue, setNewTaskCustomValue] = useState(1)
  const [newTaskCustomUnit, setNewTaskCustomUnit] = useState<CustomUnit>('day')
  const [confettiTrigger, setConfettiTrigger] = useState(0)
  const totalCompletions = tasks.reduce((sum, t) => sum + (t.completedCount || 0), 0)
  const filledInCycle = totalCompletions % MATRIX_SIZE
  const currentCycle = Math.floor(totalCompletions / MATRIX_SIZE)
  const colorFamily = DOT_COLORS[currentCycle % DOT_COLORS.length]

  const getMilestoneText = (count: number): string => {
    if (count === 0) return '开始你的第一个循环吧 🌱'
    if (count < 5) return '小小的积累，正在发芽 🌱'
    if (count < 10) return '坚持得不错，继续保持 🌿'
    if (count < 20) return '你已经形成了节奏感 🌳'
    if (count < 50) return '生活正在稳步向前 🏡'
    if (count < 100) return '了不起的坚持！你已经创造了习惯 🌟'
    return '循环已成为你生活的一部分 ✨'
  }

  // Todo state
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [newTodoText, setNewTodoText] = useState('')

  const ICONS = ['🧹', '🗑️', '🛏️', '💆', '📦', '🌿', '🧺', '🪴', '🍳', '💊']

  const freqLabel: Record<RecurringFrequency, string> = {
    weekly: '每周',
    monthly: '每月',
    yearly: '每年',
    custom: '自定',
  }

  const getFreqDisplay = (task: RecurringTask): string => {
    if (task.frequency === 'custom') {
      if (task.customValue && task.customUnit) {
        const unitLabel = task.customUnit === 'day' ? '天' : task.customUnit === 'week' ? '周' : '个月'
        return `每${task.customValue}${unitLabel}`
      }
      return '自定'
    }
    return freqLabel[task.frequency]
  }

  const addTask = () => {
    if (!newTaskTitle.trim()) return
    updateData(d => {
      d.recurringTasks = d.recurringTasks || []
      const taskData: RecurringTask = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: newTaskTitle.trim(),
        icon: newTaskIcon,
        frequency: newTaskFreq,
        createdAt: new Date().toISOString(),
      }
      if (newTaskFreq === 'custom') {
        taskData.customValue = newTaskCustomValue
        taskData.customUnit = newTaskCustomUnit
      }
      d.recurringTasks.push(taskData)
    })
    setNewTaskTitle('')
    setShowAddTask(false)
  }

  const deleteTask = (id: string) => {
    updateData(d => {
      d.recurringTasks = (d.recurringTasks || []).filter(t => t.id !== id)
    })
  }

  const markTaskDone = (id: string) => {
    updateData(d => {
      const task = (d.recurringTasks || []).find(t => t.id === id)
      if (task) {
        task.lastCompletedDate = new Date().toISOString()
        task.completedCount = (task.completedCount || 0) + 1
      }
    })
    setConfettiTrigger(prev => prev + 1)
  }

  const unmarkTaskDone = (id: string) => {
    updateData(d => {
      const task = (d.recurringTasks || []).find(t => t.id === id)
      if (task) {
        task.lastCompletedDate = undefined
      }
    })
  }

  const addTodo = () => {
    if (!newTodoText.trim()) return
    updateData(d => {
      d.todos = d.todos || []
      d.todos.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        text: newTodoText.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      })
    })
    setNewTodoText('')
    setShowAddTodo(false)
  }

  const toggleTodo = (id: string) => {
    updateData(d => {
      const todo = (d.todos || []).find(t => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
        todo.completedAt = todo.completed ? new Date().toISOString() : undefined
      }
    })
  }

  const deleteTodo = (id: string) => {
    updateData(d => {
      d.todos = (d.todos || []).filter(t => t.id !== id)
    })
  }

  return (
    <div className="py-6">

      {/* Stats card - dot matrix with color cycle */}
      {tasks.length > 0 && (
        <div className="bg-white rounded-2xl px-5 py-5 border border-warm-gray shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sage via-light-brown to-sage" />
          <div className="flex items-center gap-4">
            {/* Left: info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌔</span>
                <span className="text-xs text-deep-brown tracking-wide">今年已完成的循环</span>
              </div>
              <div className="mt-1">
                <span className="text-4xl font-light text-caramel tabular-nums">{totalCompletions}</span>
                <span className="text-xs text-deep-brown ml-1">次</span>
              </div>
              <div className="mt-2.5 text-xs text-sage-dark bg-sage-light/80 rounded-full px-3 py-1 inline-block">
                {getMilestoneText(totalCompletions)}
              </div>
            </div>

            {/* Right: dot matrix */}
            <div className="flex-shrink-0">
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: MATRIX_SIZE }).map((_, i) => {
                  const isFilled = i < filledInCycle
                  const gradientPos = MATRIX_SIZE > 1 ? i / (MATRIX_SIZE - 1) : 0
                  const fillColor = lerpColor(colorFamily.light, colorFamily.dark, gradientPos)
                  return (
                    <div
                      key={i}
                      className="w-3.5 h-3.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: isFilled ? fillColor : 'transparent',
                        border: isFilled ? 'none' : '1.5px solid #D4C5A9',
                      }}
                    />
                  )
                })}
              </div>
              {/* Cycle indicator */}
              <div className="text-[10px] text-light-brown text-center mt-1.5">
                第 {currentCycle + 1} 轮 · {MATRIX_SIZE - filledInCycle} 格剩余
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 记得要做 (Todos first) ===== */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-light-brown rounded-full" />
          <span className="text-sm font-medium text-caramel">记得要做</span>
        </div>

        {todos.length === 0 && !showAddTodo && (
          <div className="bg-cream rounded-xl py-5 text-center border border-dashed border-warm-gray mb-3">
            <p className="text-xs text-light-brown">还没有待办事项</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {visibleTodos.map(todo => (
            <div key={todo.id} className={`bg-white rounded-xl px-4 py-3 border transition-all ${
              todo.completed ? 'border-warm-gray opacity-50' : 'border-warm-gray'
            }`}>
              <div className="flex items-center gap-3">
                <span onClick={() => toggleTodo(todo.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs cursor-pointer transition-all flex-shrink-0 ${
                    todo.completed ? 'bg-sage border-sage text-white' : 'border-light-brown hover:border-sage'
                  }`}>
                  {todo.completed ? '✓' : ''}
                </span>
                <span onClick={() => toggleTodo(todo.id)}
                  className={`flex-1 text-sm cursor-pointer ${todo.completed ? 'text-deep-brown line-through' : 'text-caramel'}`}>
                  {todo.text}
                </span>
                <button onClick={() => deleteTodo(todo.id)}
                  className="text-xs text-light-brown hover:text-deep-brown transition-colors flex-shrink-0 opacity-40 hover:opacity-100">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAddTodo ? (
          <div className="flex gap-2 mt-2">
            <input autoFocus value={newTodoText} onChange={e => setNewTodoText(e.target.value)}
              placeholder="写一个待办..."
              className="flex-1 text-sm text-caramel bg-white rounded-xl px-4 py-3 border border-sage outline-none placeholder:text-light-brown"
              onKeyDown={e => e.key === 'Enter' && addTodo()}
            />
            <button onClick={addTodo} disabled={!newTodoText.trim()}
              className="px-4 py-3 rounded-xl text-sm text-white bg-sage disabled:opacity-40 transition-opacity">
              添加
            </button>
            <button onClick={() => setShowAddTodo(false)}
              className="px-3 py-3 rounded-xl text-sm text-deep-brown bg-cream border border-warm-gray">
              取消
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAddTodo(true)}
            className="mt-2 w-full py-2.5 rounded-xl text-sm text-deep-brown bg-cream border border-dashed border-light-brown hover:bg-warm-gray transition-colors">
            + 添加待办
          </button>
        )}
      </div>

      {/* ===== 生活循环 ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-sage rounded-full" />
          <span className="text-sm font-medium text-caramel">生活循环</span>
        </div>

        {tasks.length === 0 && !showAddTask && (
          <div className="bg-cream rounded-xl py-5 text-center border border-dashed border-warm-gray mb-3">
            <p className="text-xs text-light-brown">还没有循环事项</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {tasks
            .sort((a, b) => {
              const aDone = isCompletedThisCycle(a) ? 1 : 0
              const bDone = isCompletedThisCycle(b) ? 1 : 0
              return aDone - bDone
            })
            .map(task => {
              const completed = isCompletedThisCycle(task)
              const daysLeft = getDaysUntilNextReset(task)

              // Color for the countdown badge
              let badgeBg = 'bg-sage/15 text-sage-dark'
              let dotColor = 'bg-sage'
              if (daysLeft <= 1) {
                badgeBg = 'bg-amber-100 text-amber-700'
                dotColor = 'bg-amber-400'
              } else if (daysLeft <= 3) {
                badgeBg = 'bg-sage/15 text-deep-brown'
                dotColor = 'bg-sage'
              }

              return (
              <div key={task.id} className={`bg-white rounded-xl px-4 py-3 border transition-all ${
                completed ? 'border-sage/20 opacity-55' : 'border-warm-gray'
              }`}>
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <span className="text-lg flex-shrink-0">{task.icon}</span>

                  {/* Title + frequency */}
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${completed ? 'text-deep-brown line-through' : 'text-caramel'}`}>
                      {task.title}
                    </span>
                    <span className="text-xs text-light-brown ml-1.5">
                      · {getFreqDisplay(task)}
                    </span>
                  </div>

                  {/* Status: countdown badge or completed */}
                  {completed ? (
                    <span className="text-xs text-sage flex-shrink-0">✓ 已完成</span>
                  ) : (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badgeBg} flex-shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      <span className="text-xs font-medium">
                        {daysLeft <= 0 ? '今天' : `${daysLeft} 天`}
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  {completed ? (
                    <button onClick={() => unmarkTaskDone(task.id)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-cream text-deep-brown border border-warm-gray hover:bg-warm-gray transition-colors flex-shrink-0">
                      撤销
                    </button>
                  ) : (
                    <button onClick={() => markTaskDone(task.id)}
                      className="w-8 h-8 rounded-full bg-sage text-white flex items-center justify-center hover:bg-sage/90 transition-colors text-sm shadow-sm flex-shrink-0">
                      ✓
                    </button>
                  )}

                  {/* Delete */}
                  <button onClick={() => deleteTask(task.id)}
                    className="text-xs text-light-brown hover:text-deep-brown transition-colors flex-shrink-0 opacity-40 hover:opacity-100">
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add recurring task */}
        {showAddTask ? (
          <div className="bg-white rounded-xl px-4 py-4 border border-sage mt-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-deep-brown">选择图标:</span>
              <div className="flex gap-1 flex-wrap">
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setNewTaskIcon(ic)}
                    className={`text-lg w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                      newTaskIcon === ic ? 'bg-sage text-white' : 'bg-cream hover:bg-warm-gray'
                    }`}>{ic}</button>
                ))}
              </div>
            </div>
            <input autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="比如：扫地拖地"
              className="w-full text-sm text-caramel bg-cream rounded-lg px-3 py-2 outline-none mb-2 placeholder:text-light-brown"
              onKeyDown={e => e.key === 'Enter' && addTask()}
            />
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-deep-brown">频率:</span>
              {(['weekly', 'monthly', 'yearly', 'custom'] as RecurringFrequency[]).map(f => (
                <button key={f} onClick={() => setNewTaskFreq(f)}
                  className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                    newTaskFreq === f ? 'bg-sage text-white' : 'bg-cream text-deep-brown border border-warm-gray'
                  }`}>{f === 'custom' ? '自定' : freqLabel[f]}</button>
              ))}
            </div>
            {newTaskFreq === 'custom' && (
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-deep-brown">每</span>
                  {/* Value input with +/- and direct typing */}
                  <div className="flex items-center bg-cream rounded-lg border border-warm-gray overflow-hidden">
                    <button onClick={() => setNewTaskCustomValue(Math.max(1, newTaskCustomValue - 1))}
                      className="px-2.5 py-1.5 text-sm text-deep-brown hover:bg-warm-gray transition-colors">−</button>
                    <input
                      type="text"
                      value={newTaskCustomValue}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val) && val >= 1) setNewTaskCustomValue(val)
                        else if (e.target.value === '') setNewTaskCustomValue(0)
                      }}
                      onBlur={() => { if (newTaskCustomValue < 1) setNewTaskCustomValue(1) }}
                      className="w-10 text-center text-sm text-caramel bg-transparent outline-none border-x border-warm-gray py-1.5"
                      inputMode="numeric"
                    />
                    <button onClick={() => setNewTaskCustomValue(Math.min(999, newTaskCustomValue + 1))}
                      className="px-2.5 py-1.5 text-sm text-deep-brown hover:bg-warm-gray transition-colors">+</button>
                  </div>
                  {/* Unit toggle */}
                  <div className="flex rounded-lg border border-warm-gray overflow-hidden">
                    {(['day', 'week', 'month'] as CustomUnit[]).map(u => (
                      <button key={u} onClick={() => setNewTaskCustomUnit(u)}
                        className={`px-3 py-1.5 text-xs transition-colors ${
                          newTaskCustomUnit === u ? 'bg-sage text-white' : 'bg-cream text-deep-brown hover:bg-warm-gray'
                        }`}>{u === 'day' ? '天' : u === 'week' ? '周' : '月'}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={addTask} disabled={!newTaskTitle.trim()}
                className="flex-1 py-2 rounded-lg text-sm text-white bg-sage disabled:opacity-40 transition-opacity">
                ✓ 添加
              </button>
              <button onClick={() => setShowAddTask(false)}
                className="px-4 py-2 rounded-lg text-sm text-deep-brown bg-cream border border-warm-gray">
                取消
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddTask(true)}
            className="mt-2 w-full py-2.5 rounded-xl text-sm text-deep-brown bg-cream border border-dashed border-light-brown hover:bg-warm-gray transition-colors">
            + 添加循环事项
          </button>
        )}
      </div>

      {/* Bottom banner */}
      <div className="mt-6 py-3.5 px-4 bg-sage-light rounded-xl text-center">
        <p className="text-sm text-sage-dark italic leading-relaxed">"在循环中流动。"</p>
      </div>

      <ConfettiEffect trigger={confettiTrigger} />
    </div>
  )
}
