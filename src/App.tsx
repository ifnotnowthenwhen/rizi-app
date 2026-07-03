import { useState } from 'react'

type Tab = 'home' | 'weekly' | 'today'

// Pages will be imported later
// import HomePage from './pages/HomePage'
// import WeeklyPage from './pages/WeeklyPage'
// import TodayPage from './pages/TodayPage'
// import BottomNav from './components/BottomNav'

function PlaceholderPage({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-deep-brown text-sm">
      {label}
    </div>
  )
}

function BottomNavPlaceholder({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (t: Tab) => void }) {
  const tabs = [
    { key: 'home' as Tab, icon: '🌱', label: '一日' },
    { key: 'weekly' as Tab, icon: '📅', label: '一周' },
    { key: 'today' as Tab, icon: '👀', label: '回顾' },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-cream/95 backdrop-blur-sm border-t border-warm-gray">
      <div className="flex justify-around py-2">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => onTabChange(tab.key)}
            className={`flex flex-col items-center gap-0.5 px-6 py-1 transition-all duration-200 ${
              activeTab === tab.key ? 'text-caramel' : 'text-light-brown'
            }`}>
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className={`text-xs ${activeTab === tab.key ? 'font-medium' : ''}`}>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')

  return (
    <div className="min-h-dvh max-w-lg mx-auto bg-cream flex flex-col">
      <main className="flex-1 overflow-y-auto px-4 pb-20">
        {activeTab === 'home' && <PlaceholderPage label="一日页面" />}
        {activeTab === 'weekly' && <PlaceholderPage label="一周页面" />}
        {activeTab === 'today' && <PlaceholderPage label="回顾页面" />}
      </main>
      <BottomNavPlaceholder activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
