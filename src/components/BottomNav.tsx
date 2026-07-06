import type { TabType } from '../types'

interface Props {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs: { key: TabType; icon: string; label: string }[] = [
  { key: 'today', icon: '🐾', label: '回顾' },
  { key: 'home', icon: '🌳', label: '一日' },
  { key: 'cycle', icon: '🌘', label: '循环' },
  { key: 'weekly', icon: '📅', label: '一周' },
]

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-cream/95 backdrop-blur-sm border-t border-warm-gray">
      <div className="flex justify-around py-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-col items-center gap-0.5 px-6 py-1 transition-all duration-200 ${
              activeTab === tab.key
                ? 'text-caramel'
                : 'text-light-brown'
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className={`text-xs ${activeTab === tab.key ? 'font-medium' : ''}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
