"use client"

import { BarChart3, CheckSquare, Package, Plus, Users, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationItems = [
  {
    title: "概览",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "任务",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "添加成员",
    url: "/members",
    icon: Users,
  },
  {
    title: "库存",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "添加商品",
    url: "/add-product",
    icon: Plus,
  },
]

export function CustomSidebar() {
  const pathname = usePathname() || "/"

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200">
      {/* 头部 */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2E90FA] text-white">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">电商管理系统</h1>
          <p className="text-sm text-gray-500">团队协作平台</p>
        </div>
      </div>

      {/* 导航菜单 */}
      <div className="p-4">
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">核心功能</h2>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? "bg-[#2E90FA] text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">扩展功能</h2>
          <nav className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 rounded-lg cursor-not-allowed">
              <Settings className="h-5 w-5" />
              <span>模块占位</span>
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}
