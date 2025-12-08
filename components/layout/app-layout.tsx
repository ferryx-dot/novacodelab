"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Profile, Notification } from "@/lib/types"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"

interface AppLayoutProps {
  children: React.ReactNode
  profile: Profile
  notifications: Notification[]
}

export function AppLayout({ children, profile, notifications }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar
          profile={profile}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 z-50 lg:hidden">
            <AppSidebar profile={profile} collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
          </div>
        </>
      )}

      {/* Main content */}
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[260px]")}>
        <AppHeader
          profile={profile}
          notifications={notifications}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
