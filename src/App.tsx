import { useState } from 'react'
import BottomNav from './components/BottomNav'
import type { TabType } from './types'

function PlaceholderPage({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-deep-brown text-sm">
      {label}
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home')

  return (
    <div className="min-h-dvh max-w-lg mx-auto bg-cream flex flex-col">
      <main className="flex-1 overflow-y-auto px-4 pb-20">
        {activeTab === 'home' && <PlaceholderPage label="一日页面" />}
        {activeTab === 'weekly' && <PlaceholderPage label="一周页面" />}
        {activeTab === 'today' && <PlaceholderPage label="回顾页面" />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
