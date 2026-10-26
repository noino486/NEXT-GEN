"use client"

import { useState, useEffect } from "react"
import Sidebar from "./sidebar"
import Header from "./header"
import { getUser, type User } from "@/lib/auth-client"

interface DashboardLayoutProps {
  children: React.ReactNode
  page?: string
}

export default function DashboardLayout({ children, page = "dashboard" }: DashboardLayoutProps) {
  const [sidebarToggle, setSidebarToggle] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    // Open sidebar by default on desktop only
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSidebarToggle(true)
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        sidebarToggle={sidebarToggle} 
        page={page}
        setSidebarToggle={setSidebarToggle}
      />
      <div className={`relative flex flex-col flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ${
        sidebarToggle ? 'lg:ml-[290px]' : 'lg:ml-0'
      }`}>
        {/* Overlay pour mobile */}
        {sidebarToggle && (
          <div 
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarToggle(false)}
          />
        )}
        
        <Header 
          sidebarToggle={sidebarToggle} 
          setSidebarToggle={setSidebarToggle}
          user={user}
        />
        
        <main className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="p-3 sm:p-4 mx-auto max-w-[2000px] md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

