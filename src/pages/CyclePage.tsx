import { useState } from 'react'
import { useAppData } from '../hooks/useLocalStorage'
import { getNextReset, getDaysUntilNextReset, isCompletedThisCycle, getCycleDays } from '../utils/storage'
import type { RecurringTask, TodoItem, RecurringFrequency } from '../types'

function getLast5AM(): Date {
  const now = new Date()
  const hour = now.getHours()
  // If hour < 5, today's 5AM hasn't happened yet — use yesterday's 5AM.
  // Otherwise use today's 5AM (same code, date stays the same).
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0, 0)
}

function CircularProgress({ task }: { task: RecurringTask }) {
  const total = getCycleDays(task)
  const now = new Date()
  const nextReset = getNextReset(task)
  const lastReset = new Date(nextReset)
  switch (task.frequency) {
    case 'weekly': lastReset.setDate(lastReset.getDate() - 7); break
    case 'monthly': lastReset.setMonth(lastReset.getMonth() - 1); break
    case 'yearly': lastReset.setFullYear(lastReset.getFullYear() - 1); break
    case 'custom': if (task.customDays) lastReset.setDate(lastReset.getDate() - task.customDays); break
  }

  const elapsed = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24))
  // Invert: show remaining instead of elapsed
  const remaining = Math.max(0, total - elapsed)
  const pct = total > 0 ? (remaining / total) * 100 : 0
  const daysLeft = getDaysUntilNextReset(task)

  const radius = 16
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  // Color: green when lots of time, amber when medium, red when urgent
  let strokeColor = '#A8B5A2' // sage (default)
  if (daysLeft <= 1) strokeColor = '#D4A574' // warm amber (urgent)
  else if (daysLeft <= 3) strokeColor = '#C8D0C4' // lighter sage (getting close)

  return (
    <div className="relative flex-shrink-0">
      <svg width="42" height="42" viewBox="0 0 42 42">
        {/* Background circle */}
        <circle cx="21" cy="21" r={radius} fill="none" stroke="#E8E0D0" strokeWidth="3.5" />
        {/* Progress circle - full when just started, empty when time is up */}
        <circle cx="21" cy="21" r={radius} fill="none" stroke={strokeColor} strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 21 21)"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Small decorative dot in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-2 h-2 rounded-full ${
          daysLeft <= 1 ? 'bg-amber-400' : 'bg-sage'
        }`} />
      </div>
    </div>
  )
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
  const [newTaskCustomDays, setNewTaskCustomDays] = useState(7)

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
    if (task.frequency === 'custom' && task.customDays) {
      return `每${task.customDays}天`
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
        taskData.customDays = newTaskCustomDays
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
      }
    })
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
      <h2 className="text-lg font-medium text-caramel text-center mb-6">在循环中流动</h2>

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
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs cursor-pointer transition-all flex-shrink-0 ${
                    todo.completed ? 'bg-sage border-sage text-white' : 'border-light-brown hover:border-sage'
                  }`}>
                  {todo.completed ? '✓' : ''}
                </span>
                <span onClick={() => toggleTodo(todo.id)} className={`flex-1 text-sm cursor-pointer ${todo.completed ? 'text-deep-brown line-through' : 'text-caramel'}`}>
                  {todo.text}
                </span>
                <button onClick={() => deleteTodo(todo.id)}
                  className="text-xs text-light-brown hover:text-deep-brown transition-colors px-1">
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
              return (
              <div key={task.id} className={`bg-white rounded-2xl px-4 py-3.5 border transition-all shadow-sm ${
                completed ? 'border-sage/20 opacity-55' : 'border-warm-gray'
              }`}>
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">{task.icon}</span>
                  <CircularProgress task={task} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${completed ? 'text-deep-brown line-through' : 'text-caramel'}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] text-deep-brown bg-cream px-2 py-0.5 rounded-full border border-warm-gray">
                        {getFreqDisplay(task)}
                      </span>
                    </div>
                    <div className="text-xs mt-1">
                      {completed ? (
                        <span className="text-sage">✓ 已完成</span>
                      ) : (
                        <span className={daysLeft <= 1 ? 'text-amber-600 font-medium' : 'text-deep-brown'}>
                          {daysLeft <= 0 ? '今天截止' : `还有 ${daysLeft} 天`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {completed ? (
                      <button onClick={() => unmarkTaskDone(task.id)}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-cream text-deep-brown border border-warm-gray hover:bg-warm-gray transition-colors">
                        撤销
                      </button>
                    ) : (
                      <button onClick={() => markTaskDone(task.id)}
                        className="w-9 h-9 rounded-full bg-sage text-white flex items-center justify-center hover:bg-sage/90 transition-colors text-base shadow-sm">
                        ✓
                      </button>
                    )}
                    <button onClick={() => deleteTask(task.id)}
                      className="text-xs px-1.5 py-1 text-light-brown hover:text-deep-brown transition-colors opacity-50 hover:opacity-100">
                      ✕
                    </button>
                  </div>
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
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-deep-brown">每</span>
                <div className="flex bg-cream rounded-lg border border-warm-gray overflow-hidden">
                  <button onClick={() => setNewTaskCustomDays(Math.max(1, newTaskCustomDays - 1))}
                    className="px-2 py-1 text-xs text-deep-brown hover:bg-warm-gray">−</button>
                  <span className="px-3 py-1 text-xs text-caramel font-medium min-w-[2rem] text-center">{newTaskCustomDays}</span>
                  <button onClick={() => setNewTaskCustomDays(Math.min(365, newTaskCustomDays + 1))}
                    className="px-2 py-1 text-xs text-deep-brown hover:bg-warm-gray">+</button>
                </div>
                <span className="text-xs text-deep-brown">天</span>
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
    </div>
  )
}
