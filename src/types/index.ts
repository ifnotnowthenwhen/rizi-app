// ===== 工作模块 =====
export type JobPlanType = 'collect' | 'submit' | 'resume' | 'portfolio' | 'custom'
export type JobDoneType = JobPlanType

export interface JobPlan {
  id: string
  type: JobPlanType
  customText?: string
  timestamp: string
}

export interface JobDone {
  type: JobDoneType
  count?: number
  customText?: string
  timestamp: string
}

// ===== 输入模块 =====
export type InputPlanType = 'read' | 'study' | 'course' | 'case' | 'custom'
export type InputDoneType = InputPlanType

export interface InputPlan {
  id: string
  type: InputPlanType
  customText?: string
  timestamp: string
}

export interface InputDone {
  type: InputDoneType
  duration?: number
  content?: string
  customText?: string
  timestamp: string
}

// ===== 身体模块 =====
export type BodyPlanType = 'walk' | 'bike' | 'exercise' | 'custom'
export type BodyDoneType = BodyPlanType

export interface BodyPlan {
  id: string
  type: BodyPlanType
  customText?: string
  timestamp: string
}

export interface BodyDone {
  type: BodyDoneType
  duration?: number
  customText?: string
  timestamp: string
}

// ===== 痕迹模块 =====
export type TracePlanType = 'diary' | 'write' | 'chore' | 'custom'
export type TraceDoneType = TracePlanType

export interface TracePlan {
  id: string
  type: TracePlanType
  customText?: string
  timestamp: string
}

export interface TraceDone {
  type: TraceDoneType
  description?: string
  customText?: string
  timestamp: string
}

// ===== 每日记录 =====
export interface DayRecord {
  date: string // "YYYY-MM-DD"
  modules: {
    job: {
      completed: boolean
      plans: JobPlan[]
      dones: JobDone[]
    }
    input: {
      completed: boolean
      plans: InputPlan[]
      dones: InputDone[]
    }
    body: {
      completed: boolean
      plans: BodyPlan[]
      dones: BodyDone[]
    }
    trace: {
      completed: boolean
      plans: TracePlan[]
      dones: TraceDone[]
    }
  }
}

// ===== 循环模块 =====
export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly' | 'custom'
export type CustomUnit = 'day' | 'week' | 'month'

export interface RecurringTask {
  id: string
  title: string
  icon: string
  frequency: RecurringFrequency
  customValue?: number
  customUnit?: CustomUnit
  lastCompletedDate?: string  // ISO date when user last marked as done
  createdAt: string
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: string
  completedAt?: string
}

// ===== 全局数据 =====
export interface AppData {
  records: DayRecord[]
  recurringTasks: RecurringTask[]
  todos: TodoItem[]
}

// ===== 模块标识 =====
export type ModuleType = 'job' | 'input' | 'body' | 'trace'

// ===== Tab 标识 =====
export type TabType = 'home' | 'weekly' | 'today' | 'cycle'
