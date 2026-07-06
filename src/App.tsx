import { useState } from 'react'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import WeeklyPage from './pages/WeeklyPage'
import TodayPage from './pages/TodayPage'
import CyclePage from './pages/CyclePage'
import type { TabType } from './types'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home')

  return (
    <div className="min-h-dvh max-w-lg mx-auto bg-cream flex flex-col">
      <main className="flex-1 overflow-y-auto px-4 pb-20">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'weekly' && <WeeklyPage />}
        {activeTab === 'today' && <TodayPage />}
        {activeTab === 'cycle' && <CyclePage />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
