'use client'

import { useState } from 'react'

interface Tab {
  id: string
  label: string
  icon: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div>
      <nav className="-mb-px flex space-x-2 overflow-x-auto scrollbar-thin">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              group relative inline-flex items-center border-b-2 px-4 py-4 text-sm font-medium transition-all duration-300 animate-fadeIn
              ${
                activeTab === tab.id
                  ? 'border-blue-400 text-white'
                  : 'border-transparent text-white/70 hover:border-white/40 hover:text-white'
              }
            `}
            style={{
              animationDelay: `${index * 0.05}s`
            }}
          >
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse"></span>
            )}
            <span className={`mr-2 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`}>
              {tab.icon}
            </span>
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

