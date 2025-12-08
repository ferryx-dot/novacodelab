"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"
import { formatCurrency } from "@/lib/utils/format"
import {
  Home,
  Code2,
  Bot,
  FolderCog as FolderCode,
  GraduationCap,
  Palette,
  Wrench,
  MessageSquare,
  FlaskConical,
  Store,
  User,
  Users,
  Terminal,
  Shield,
  Sparkles,
  ChevronLeft,
  Crown,
  BadgeCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/ai-studio", label: "AI Code Studio", icon: Code2 },
  { href: "/bot-arsenal", label: "Bot Arsenal", icon: Bot },
  { href: "/coding-hub", label: "Coding Hub", icon: FolderCode },
  { href: "/academy", label: "Academy", icon: GraduationCap },
  { href: "/design-studio", label: "Design Studio", icon: Palette },
  { href: "/toolbox", label: "Toolbox", icon: Wrench },
  { href: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { href: "/advanced-lab", label: "Advanced Lab", icon: FlaskConical },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/community", label: "Community", icon: Users },
  { href: "/terminal", label: "Terminal", icon: Terminal },
]

interface AppSidebarProps {
  profile: Profile
  collapsed?: boolean
  onToggle?: () => void
}

export function AppSidebar({ profile, collapsed = false, onToggle }: AppSidebarProps) {
  const pathname = usePathname()

  const getUserBadge = () => {
    if (profile.is_admin) {
      return (
        <span className="inline-flex items-center text-yellow-500" title="Admin">
          <Crown className="w-4 h-4" />
          <BadgeCheck className="w-4 h-4 text-primary" />
        </span>
      )
    }
    if (profile.is_verified) {
      return <BadgeCheck className="w-4 h-4 text-primary" title="Verified" />
    }
    return null
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          collapsed ? "w-[70px]" : "w-[260px]",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && <span className="font-bold text-sidebar-foreground whitespace-nowrap">NovaCode Labs</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* User Info */}
        <div className={cn("p-4 border-b border-sidebar-border", collapsed && "px-2")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {profile.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sidebar-foreground truncate">{profile.username}</span>
                  {getUserBadge()}
                </div>
                <p className="text-sm text-primary font-semibold">
                  {profile.is_admin ? "∞" : formatCurrency(profile.balance)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const NavIcon = item.icon

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-2",
                )}
              >
                <NavIcon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{linkContent}</div>
          })}

          {/* Admin Panel - only visible to admin */}
          {profile.is_admin && (
            <>
              <div className={cn("pt-4", !collapsed && "px-3")}>
                {!collapsed && (
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Administration
                  </p>
                )}
              </div>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/admin"
                      className={cn(
                        "flex items-center justify-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        pathname.startsWith("/admin")
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "text-yellow-500 hover:bg-yellow-500/10",
                      )}
                    >
                      <Shield className="w-5 h-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    Admin Panel
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname.startsWith("/admin")
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "text-yellow-500 hover:bg-yellow-500/10",
                  )}
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className={cn("p-4 border-t border-sidebar-border", collapsed && "p-2")}>
          {!collapsed && <p className="text-xs text-muted-foreground text-center">© 2025 NovaCode Labs</p>}
        </div>
      </aside>
    </TooltipProvider>
  )
}
