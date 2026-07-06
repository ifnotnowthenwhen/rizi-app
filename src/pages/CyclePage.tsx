import { useState } from 'react'
import { useAppData } from '../hooks/useLocalStorage'
import { getNextReset, getDaysUntilNextReset, isCompletedThisCycle } from '../utils/storage'
import type { RecurringTask, TodoItem, RecurringFrequency } from '../types'

export default function CyclePage() {
  const { data, updateData } = useAppData()
  const tasks = data.recurringTasks || []
  const todos = data.todos || []

  // Recurring task state
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskIcon, setNewTaskIcon] = useState('🧹')
  const [newTaskFreq, setNewTaskFreq] = useState<RecurringFrequency>('weekly')

  // Todo state
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [newTodoText, setNewTodoText] = useState('')

  const ICONS = ['🧹', '🗑️', '🛏️', '💆', '📦', '🌿', '🧺', '🪴', '🍳', '💊']

  const addTask = () => {
    if (!newTaskTitle.trim()) return
    updateData(d => {
      d.recurringTasks = d.recurringTasks || []
      d.recurringTasks.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: newTaskTitle.trim(),
        icon: newTaskIcon,
        frequency: newTaskFreq,
        createdAt: new Date().toISOString(),
      })
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

  const freqLabel: Record<RecurringFrequency, string> = {
    weekly: '每周',
    monthly: '每月',
    yearly: '每年',
  }

  return (
    <div className="py-6">
      <h2 className="text-base font-medium text-caramel text-center mb-6">🔄 循环</h2>

      {/* ===== 循环事项 ===== */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-sage rounded-full" />
          <span className="text-sm font-medium text-caramel">循环事项</span>
        </div>

        {tasks.length === 0 && !showAddTask && (
          <div className="bg-cream rounded-xl py-5 text-center border border-dashed border-warm-gray mb-3">
            <p className="text-xs text-light-brown">还没有循环事项</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {tasks.map(task => {
            const completed = isCompletedThisCycle(task)
            const daysLeft = getDaysUntilNextReset(task)
            return (
              <div key={task.id} className={`bg-white rounded-xl px-4 py-3 border transition-all ${
                completed ? 'border-sage/30 opacity-60' : 'border-warm-gray'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{task.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${completed ? 'text-deep-brown line-through' : 'text-caramel'}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] text-light-brown bg-cream px-1.5 py-0.5 rounded">
                        {freqLabel[task.frequency]}
                      </span>
                    </div>
                    <div className="text-xs mt-0.5">
                      {completed ? (
                        <span className="text-sage">✓ 已完成 · 距重置还有 {daysLeft} 天</span>
                      ) : (
                        <span className={daysLeft <= 1 ? 'text-amber-600 font-medium' : 'text-deep-brown'}>
                          还有 {daysLeft} 天
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {completed ? (
                      <button onClick={() => unmarkTaskDone(task.id)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-cream text-deep-brown border border-warm-gray hover:bg-warm-gray transition-colors">
                        撤销
                      </button>
                    ) : (
                      <button onClick={() => markTaskDone(task.id)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-sage text-white hover:bg-sage/90 transition-colors">
                        ✓
                      </button>
                    )}
                    <button onClick={() => deleteTask(task.id)}
                      className="text-xs px-2 py-1 rounded-lg text-light-brown hover:text-deep-brown transition-colors">
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
              {(['weekly', 'monthly', 'yearly'] as RecurringFrequency[]).map(f => (
                <button key={f} onClick={() => setNewTaskFreq(f)}
                  className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                    newTaskFreq === f ? 'bg-sage text-white' : 'bg-cream text-deep-brown border border-warm-gray'
                  }`}>{freqLabel[f]}</button>
              ))}
            </div>
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

      {/* ===== 临时待办 ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-light-brown rounded-full" />
          <span className="text-sm font-medium text-caramel">临时待办</span>
        </div>

        {todos.length === 0 && !showAddTodo && (
          <div className="bg-cream rounded-xl py-5 text-center border border-dashed border-warm-gray mb-3">
            <p className="text-xs text-light-brown">还没有待办事项</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {todos.map(todo => (
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
                <span className={`flex-1 text-sm ${todo.completed ? 'text-deep-brown line-through' : 'text-caramel'}`}>
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
    </div>
  )
}
